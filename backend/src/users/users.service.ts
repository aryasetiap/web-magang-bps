import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        namaLengkap: true,
        nimNisn: true,
        asalInstitusi: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id: id },
        data: updateUserDto,
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
          updatedAt: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
