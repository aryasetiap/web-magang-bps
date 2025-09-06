/**
 * Modul AuthService
 * -----------------------------------------------
 * Menyediakan layanan autentikasi, registrasi, verifikasi email,
 * login (termasuk Google), pengelolaan password, dan pengiriman OTP via email.
 */

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
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Layanan autentikasi utama untuk aplikasi.
 * Menangani registrasi, login, verifikasi email, pengelolaan password, dan integrasi Google.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrasi user baru dan kirim OTP ke email untuk verifikasi.
   * @param registerDto Data registrasi user
   * @returns Informasi user baru dan pesan status
   * @throws ConflictException jika email sudah terdaftar
   * @throws InternalServerErrorException jika terjadi kesalahan server
   */
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'Intern' },
    });
    if (!defaultRole) {
      throw new InternalServerErrorException(
        "Role default 'Intern' tidak ditemukan.",
      );
    }

    const otp = this.generateOtp();
    const otpExpires = this.generateOtpExpiry();

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
          role: { select: { name: true } },
        },
      });

      try {
        await this.sendOtpEmail(email, otp);
      } catch {
        await this.prisma.user.delete({ where: { email } });
        throw new InternalServerErrorException(
          'Gagal mengirim email OTP. Silakan coba lagi.',
        );
      }

      return {
        message: 'Registrasi berhasil. Silakan verifikasi email Anda.',
        user: newUser,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === 'P2002'
      ) {
        throw new ConflictException('Email sudah terdaftar.');
      }
      throw new InternalServerErrorException();
    }
  }

  /**
   * Login user dengan email dan password.
   * @param loginDto Data login user
   * @returns Token JWT dan data user
   * @throws UnauthorizedException jika kredensial salah atau email belum diverifikasi
   */
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
      throw new UnauthorizedException(
        'Email belum diverifikasi. Silakan cek email Anda.',
      );
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

  /**
   * Login atau registrasi user menggunakan akun Google.
   * @param googleUser Data user dari Google
   * @returns Token JWT dan data user
   * @throws UnauthorizedException jika data user Google tidak valid
   */
  async googleLogin(googleUser: GoogleUser) {
    if (!googleUser) {
      throw new UnauthorizedException('No user from google');
    }

    const user = await this.validateGoogleUser(googleUser);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: { name: user.role.name },
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Validasi user Google, jika belum ada maka buat user baru.
   * @param googleUser Data user dari Google
   * @returns Data user
   * @throws InternalServerErrorException jika role default tidak ditemukan
   */
  async validateGoogleUser(googleUser: GoogleUser) {
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

  /**
   * Generate JWT token untuk user.
   * @param user Data user
   * @returns Token JWT
   */
  generateJwt(user: { userId: number; email: string; role: string }) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Ganti password user.
   * @param userId ID user
   * @param oldPassword Password lama
   * @param newPassword Password baru
   * @returns Pesan status
   * @throws UnauthorizedException jika user tidak ditemukan atau password salah
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password lama salah');

    if (oldPassword === newPassword)
      throw new UnauthorizedException(
        'Password baru tidak boleh sama dengan password lama',
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  /**
   * Proses lupa password, kirim OTP ke email user.
   * @param email Email user
   * @returns Pesan status
   * @throws UnauthorizedException jika email tidak ditemukan atau OTP masih aktif
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email tidak ditemukan');

    if (
      user.resetPasswordOtpExpires &&
      user.resetPasswordOtpExpires > new Date()
    ) {
      throw new UnauthorizedException(
        'OTP reset password masih aktif, cek email Anda.',
      );
    }

    const otp = this.generateOtp();
    const otpExpires = this.generateOtpExpiry();

    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordOtp: otp, resetPasswordOtpExpires: otpExpires },
    });

    await this.sendOtpEmail(email, otp, true);

    return {
      message: 'OTP reset password telah dikirim ke email Anda.',
    };
  }

  /**
   * Verifikasi OTP reset password dan set password baru.
   * @param email Email user
   * @param otp Kode OTP
   * @param newPassword Password baru
   * @returns Pesan status
   * @throws UnauthorizedException jika user/OTP tidak ditemukan, salah, atau kadaluarsa
   */
  async verifyResetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires)
      throw new UnauthorizedException('OTP tidak ditemukan');
    if (user.resetPasswordOtp !== otp)
      throw new UnauthorizedException('OTP salah');
    if (user.resetPasswordOtpExpires < new Date())
      throw new UnauthorizedException('OTP kadaluarsa');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
      },
    });

    return {
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    };
  }

  /**
   * Kirim email OTP ke user, bisa untuk verifikasi email atau reset password.
   * @param email Email tujuan
   * @param otp Kode OTP
   * @param isReset True jika untuk reset password
   * @throws InternalServerErrorException jika gagal mengirim email
   */
  async sendOtpEmail(email: string, otp: string, isReset = false) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter: Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subject = isReset
      ? '🔒 Permintaan Reset Password - Kode OTP Magang BPS Kab. Pringsewu'
      : '🔑 Verifikasi Email Anda - Kode OTP Magang BPS Kab. Pringsewu';

    const text = isReset
      ? `Halo!\n\nAnda meminta reset password akun Magang BPS Kab. Pringsewu.\nKode OTP Anda: ${otp}\n\nJangan bagikan kode ini kepada siapapun.\n\nSalam,\nMagang BPS Kab. Pringsewu\n\n© Arya Setia Pratama & Divany Pangestika | Universitas Lampung 2025`
      : `Halo!\n\nTerima kasih telah mendaftar di Magang BPS Kab. Pringsewu.\nKode OTP verifikasi email Anda: ${otp}\n\nJangan bagikan kode ini kepada siapapun.\n\nSalam,\nMagang BPS Kab. Pringsewu\n\n© Arya Setia Pratama & Divany Pangestika | Universitas Lampung 2025`;

    const html = isReset
      ? this.getResetPasswordEmailHtml(otp)
      : this.getVerificationEmailHtml(otp);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await transporter.sendMail({
        from: '"Magang BPS Kab. Pringsewu" <noreply@bps.go.id>',
        to: email,
        subject,
        text,
        html,
      });
    } catch {
      throw new InternalServerErrorException('Gagal mengirim email OTP.');
    }
  }

  /**
   * Verifikasi OTP email user.
   * @param email Email user
   * @param otp Kode OTP
   * @returns Pesan status
   * @throws UnauthorizedException jika user/OTP tidak ditemukan, salah, atau kadaluarsa
   */
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (user.isEmailVerified) return { message: 'Email sudah diverifikasi' };
    if (!user.emailOtp || !user.emailOtpExpires)
      throw new UnauthorizedException('OTP tidak ditemukan');
    if (user.emailOtp !== otp) throw new UnauthorizedException('OTP salah');
    if (user.emailOtpExpires < new Date())
      throw new UnauthorizedException('OTP kadaluarsa');

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

  /**
   * Kirim ulang OTP verifikasi email dengan rate limit.
   * @param email Email user
   * @returns Pesan status
   * @throws UnauthorizedException jika user tidak ditemukan, email sudah diverifikasi, atau rate limit
   */
  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    if (user.isEmailVerified) return { message: 'Email sudah diverifikasi' };

    if (
      user.emailOtp &&
      user.emailOtpExpires &&
      user.emailOtpExpires > new Date()
    ) {
      throw new UnauthorizedException(
        'OTP masih aktif, silakan cek email Anda.',
      );
    }

    const now = new Date();
    if (user.lastOtpSentAt) {
      const diff =
        (now.getTime() - new Date(user.lastOtpSentAt).getTime()) /
        (1000 * 60 * 60);
      if (diff < 1) {
        throw new UnauthorizedException(
          'Anda hanya dapat meminta OTP sekali per jam.',
        );
      }
    }

    const otp = this.generateOtp();
    const otpExpires = this.generateOtpExpiry();

    await this.prisma.user.update({
      where: { email },
      data: { emailOtp: otp, emailOtpExpires: otpExpires, lastOtpSentAt: now },
    });

    await this.sendOtpEmail(email, otp);

    return { message: 'OTP baru telah dikirim ke email Anda.' };
  }

  /**
   * Generate kode OTP 6 digit.
   * @returns Kode OTP sebagai string
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate waktu kadaluarsa OTP (10 menit dari sekarang).
   * @returns Tanggal kadaluarsa OTP
   */
  private generateOtpExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  /**
   * Template HTML email untuk verifikasi email.
   * @param otp Kode OTP
   * @returns HTML string
   */
  private getVerificationEmailHtml(otp: string): string {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #eee;padding:24px;">
        <h2 style="color:#1976d2;">Verifikasi Email Anda</h2>
        <p>Halo!</p>
        <p>Terima kasih telah mendaftar di <b>Magang BPS Kab. Pringsewu</b>.</p>
        <p style="font-size:18px;">Kode OTP verifikasi email Anda:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#1976d2;margin:16px 0;">${otp}</div>
        <p>Jangan bagikan kode ini kepada siapapun. Kode berlaku selama 10 menit.</p>
        <br>
        <p>Salam,<br>Magang BPS Kab. Pringsewu</p>
        <hr>
        <small style="color:#888;">&copy; Arya Setia Pratama &amp; Divany Pangestika | Universitas Lampung 2025</small>
      </div>
    `;
  }

  /**
   * Template HTML email untuk reset password.
   * @param otp Kode OTP
   * @returns HTML string
   */
  private getResetPasswordEmailHtml(otp: string): string {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #eee;padding:24px;">
        <h2 style="color:#1976d2;">Permintaan Reset Password</h2>
        <p>Halo!</p>
        <p>Anda meminta reset password akun <b>Magang BPS Kab. Pringsewu</b>.</p>
        <p style="font-size:18px;">Kode OTP Anda:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#1976d2;margin:16px 0;">${otp}</div>
        <p>Jangan bagikan kode ini kepada siapapun. Kode berlaku selama 10 menit.</p>
        <br>
        <p>Salam,<br>Magang BPS Kab. Pringsewu</p>
        <hr>
        <small style="color:#888;">&copy; Arya Setia Pratama &amp; Divany Pangestika | Universitas Lampung 2025</small>
      </div>
    `;
  }
}
