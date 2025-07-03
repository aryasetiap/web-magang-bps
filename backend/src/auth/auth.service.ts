import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Kita inject PrismaService agar bisa berinteraksi dengan database
  constructor(private prisma: PrismaService) {}

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    // 1. Hash password pengguna untuk keamanan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Cari ID untuk peran 'mahasiswa'
    const role = await this.prisma.role.findUnique({
      where: { name: 'Mahasiswa' }, // <-- INI BENAR (sesuai seed.ts)
    });

    if (!role) {
      // Ini adalah kasus darurat jika peran 'mahasiswa' tidak ada di database
      throw new InternalServerErrorException('Default role not found.');
    }

    try {
      // 3. Buat user baru di database
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

      // 4. Kembalikan data user baru (tanpa password)
      return newUser;
    } catch (error) {
      // Tangani error jika email sudah ada (karena ada constraint 'unique')
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }
}
