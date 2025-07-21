import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer'; // npm install nodemailer
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'Intern' },
    });

    if (!defaultRole) {
      throw new InternalServerErrorException(
        "Role default 'Intern' tidak ditemukan.",
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: defaultRole.id,
          isEmailVerified: false,
          emailOtp: otp,
          emailOtpExpires: otpExpires,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      // Kirim OTP ke email user
      try {
        await this.sendOtpEmail(email, otp);
      } catch (mailErr) {
        // Hapus user jika gagal kirim email
        console.error('Gagal mengirim email OTP:', mailErr);
        await this.prisma.user.delete({ where: { email } });
        throw new InternalServerErrorException('Gagal mengirim email OTP. Silakan coba lagi.');
      }

      return {
        message: 'Registrasi berhasil. Silakan verifikasi email Anda.',
        user: newUser,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email sudah terdaftar.');
      }
      throw new InternalServerErrorException();
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email belum diverifikasi. Silakan cek email Anda.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: { name: user.role.name },
      },
    };
  }

  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new UnauthorizedException('No user from google');
    }

    const user = await this.validateGoogleUser(googleUser);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          name: user.role.name,
        },
      },
      access_token,
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, firstName, lastName } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'Intern' },
      });

      if (!defaultRole) {
        throw new InternalServerErrorException(
          "Role default 'Intern' tidak ditemukan.",
        );
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: hashedPassword,
          roleId: defaultRole.id,
        },
        include: { role: true },
      });
    }

    return user;
  }

  generateJwt(user: { userId: number; email: string; role: string }) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Password lama salah');

    if (oldPassword === newPassword) throw new UnauthorizedException('Password baru tidak boleh sama dengan password lama');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email tidak ditemukan');

    // Rate limit: 1x per 10 menit
    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires > new Date()) {
      throw new UnauthorizedException('OTP reset password masih aktif, cek email Anda.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordOtp: otp, resetPasswordOtpExpires: otpExpires },
    });

    // Kirim OTP ke email
    await this.sendOtpEmail(email, otp, true);

    return { message: 'OTP reset password telah dikirim ke email Anda.' };
  }

  async verifyResetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) throw new UnauthorizedException('OTP tidak ditemukan');
    if (user.resetPasswordOtp !== otp) throw new UnauthorizedException('OTP salah');
    if (user.resetPasswordOtpExpires < new Date()) throw new UnauthorizedException('OTP kadaluarsa');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
      },
    });

    return { message: 'Password berhasil direset. Silakan login dengan password baru.' };
  }

  // Ubah sendOtpEmail agar bisa dipakai untuk reset password juga
  async sendOtpEmail(email: string, otp: string, isReset = false) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subject = isReset
      ? 'Kode OTP Reset Password'
      : 'Kode OTP Verifikasi Email';
    const text = isReset
      ? `Kode OTP reset password Anda: ${otp}`
      : `Kode OTP Anda: ${otp}`;
    const html = isReset
      ? `<p>Kode OTP reset password Anda: <b>${otp}</b></p>`
      : `<p>Kode OTP Anda: <b>${otp}</b></p>`;

    await transporter.sendMail({
      from: '"BPS Magang" <noreply@bps.go.id>',
      to: email,
      subject,
      text,
      html,
    });
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (user.isEmailVerified) return { message: 'Email sudah diverifikasi' };
    if (!user.emailOtp || !user.emailOtpExpires) throw new UnauthorizedException('OTP tidak ditemukan');
    if (user.emailOtp !== otp) throw new UnauthorizedException('OTP salah');
    if (user.emailOtpExpires < new Date()) throw new UnauthorizedException('OTP kadaluarsa');

    await this.prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpires: null,
      },
    });

    return { message: 'Email berhasil diverifikasi' };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (user.isEmailVerified) return { message: 'Email sudah diverifikasi' };

    // Rate limit: cek jika OTP masih aktif
    if (user.emailOtp && user.emailOtpExpires && user.emailOtpExpires > new Date()) {
      throw new UnauthorizedException('OTP masih aktif, silakan cek email Anda.');
    }

    // Tambahan: Rate limit per jam (misal: max 3x per jam)
    const now = new Date();
    if (user.lastOtpSentAt) {
      const diff = (now.getTime() - new Date(user.lastOtpSentAt).getTime()) / (1000 * 60 * 60); // jam
      if (diff < 1) {
        throw new UnauthorizedException('Anda hanya dapat meminta OTP sekali per jam.');
      }
    }

    // Generate OTP baru
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { emailOtp: otp, emailOtpExpires: otpExpires, lastOtpSentAt: now },
    });

    await this.sendOtpEmail(email, otp);

    return { message: 'OTP baru telah dikirim ke email Anda.' };
  }
}
