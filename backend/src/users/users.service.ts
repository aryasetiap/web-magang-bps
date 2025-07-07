import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // 1. Pastikan path import ini benar
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // 2. Tambahkan constructor untuk inject PrismaService
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // Ganti method findAll() yang lama dengan ini
  async findAll() {
    // Mengambil semua user dari database
    return this.prisma.user.findMany({
      // Praktik yang baik: jangan kembalikan password dalam response
      select: {
        id: true,
        name: true,
        email: true,
        namaLengkap: true,
        nimNisn: true,
        asalInstitusi: true,
        // Pilih field lain yang aman untuk ditampilkan
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // Ganti method findOne() yang lama dengan ini
  async findOne(id: number) {
    // Mencari satu user berdasarkan ID uniknya
    return this.prisma.user.findUnique({
      where: { id: id },
      // Pilih field yang ingin ditampilkan untuk detail user
      select: {
        id: true,
        name: true,
        email: true,
        namaLengkap: true,
        nimNisn: true,
        asalInstitusi: true,
        jurusanProdi: true,
        nomorTelepon: true,
        alamat: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
