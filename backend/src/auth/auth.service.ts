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

    // 3. Cari ID untuk peran 'mahasiswa'
    const role = await this.prisma.role.findUnique({
      where: { name: 'Mahasiswa' }, // <-- INI BENAR (sesuai seed.ts)
    });

    if (!role) {
      // Ini adalah kasus darurat jika peran 'mahasiswa' tidak ada di database
      throw new InternalServerErrorException('Default role not found.');
    }

    try {
      // 4. Buat user baru di database
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: role.id,
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
    if (!req) {
      throw new UnauthorizedException('Tidak ada data user dari Google');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: req.email },
      include: { role: true },
    });

    if (user) {
      const payload = { email: user.email, sub: user.id, role: user.role.name };
      return {
        message: 'User login berhasil',
        access_token: this.jwtService.sign(payload),
      };
    }

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'Mahasiswa' },
    });
    if (!defaultRole) {
      throw new InternalServerErrorException(
        'Role default "Mahasiswa" tidak ditemukan.',
      );
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: req.email,
        name: `${req.firstName} ${req.lastName}`,
        password: '', // Password tidak perlu karena login via Google
        roleId: defaultRole.id,
      },
    });

    const payload = {
      email: newUser.email,
      sub: newUser.id,
      role: 'Mahasiswa',
    };
    return {
      message: 'User baru dibuat dan login berhasil',
      access_token: this.jwtService.sign(payload),
    };
  }
}
