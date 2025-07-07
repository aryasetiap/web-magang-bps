import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto'; // 1. Impor modul crypto bawaan dari Node.js

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    // TODO: Cek jika email sudah terdaftar (bisa ditambahkan nanti)

    // 2. Hash password sebelum disimpan
    const saltRounds = 10; // Standar industri
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Cari ID untuk peran 'Intern'
    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'Intern' }, // <-- UBAH DI SINI
    });

    if (!defaultRole) {
      // Ini adalah kasus darurat jika peran 'Intern' tidak ada di database
      throw new InternalServerErrorException(
        "Role default 'Intern' tidak ditemukan.",
      ); // Ubah juga pesan errornya
    }

    try {
      // 4. Buat user baru di database
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: defaultRole.id,
        },
        // Pilih data yang ingin dikembalikan
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

      // 5. Kembalikan data user baru (tanpa password)
      return newUser;
    } catch (error) {
      // Tangani error jika email sudah ada (karena ada constraint 'unique')
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

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

    // 3. Buat payload dan generate token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(req) {
    console.log('--- GOOGLE LOGIN PROCESS STARTED ---');
    try {
      if (!req || !req.email) {
        console.error(
          "ERROR: Request object from Google is missing or doesn't have an email.",
        );
        throw new UnauthorizedException('Tidak ada data user dari Google');
      }
      console.log('1. Received user data from Google:', req);

      console.log(`2. Checking for existing user with email: ${req.email}`);
      const user = await this.prisma.user.findUnique({
        where: { email: req.email },
        include: { role: true },
      });

      if (user) {
        console.log('3a. User found in DB. Generating JWT.');
        const payload = {
          email: user.email,
          sub: user.id,
          role: user.role.name,
        };
        const accessToken = this.jwtService.sign(payload);
        console.log('--- GOOGLE LOGIN PROCESS FINISHED (EXISTING USER) ---');
        return {
          message: 'User login berhasil',
          access_token: accessToken,
        };
      }

      console.log('3b. User not found. Proceeding to create a new user.');

      console.log("4. Finding default role 'Intern'...");
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'Intern' },
      });

      if (!defaultRole) {
        console.error(
          "FATAL: Default role 'Intern' not found in the database!",
        );
        throw new InternalServerErrorException(
          'Role default "Intern" tidak ditemukan.',
        );
      }
      console.log('5. Default role found:', defaultRole);

      console.log('6. Generating and hashing a random password...');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      console.log('7. Random password hashed successfully.');

      const newUserPayload = {
        email: req.email,
        name: `${req.firstName} ${req.lastName}`,
        password: hashedPassword,
        roleId: defaultRole.id,
      };
      console.log(
        '8. Attempting to create user in DB with payload:',
        newUserPayload,
      );

      const newUser = await this.prisma.user.create({
        data: newUserPayload,
      });
      console.log('9. New user created successfully in DB:', newUser);

      const payload = { email: newUser.email, sub: newUser.id, role: 'Intern' };
      const accessToken = this.jwtService.sign(payload);
      console.log('--- GOOGLE LOGIN PROCESS FINISHED (NEW USER) ---');

      return {
        message: 'User baru dibuat dan login berhasil',
        access_token: accessToken,
      };
    } catch (error) {
      // Ini adalah bagian terpenting!
      console.error('!!!!!! CRITICAL ERROR IN googleLogin !!!!!!', error);
      // Kita lempar lagi agar NestJS tetap mencoba menanganinya
      throw new InternalServerErrorException(
        'Terjadi kesalahan kritis saat proses login Google.',
      );
    }
  }

  generateJwt(user: { userId: number; email: string; role: string }) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
