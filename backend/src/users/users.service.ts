import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'; // 1. Impor DTO Paginasi

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    // Logika untuk create user
    return 'This action adds a new user';
  }

  // 2. Modifikasi method findAll secara menyeluruh
  async findAll(paginationQuery: PaginationQueryDto) {
    // Default value jika page/limit tidak dikirim
    const page =
      Number(paginationQuery.page) > 0 ? Number(paginationQuery.page) : 1;
    const limit =
      Number(paginationQuery.limit) > 0 ? Number(paginationQuery.limit) : 10;

    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          namaLengkap: true,
          asalInstitusi: true,
          role: {
            select: {
              name: true,
            },
          },
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        totalItems: total,
        itemCount: users.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: totalPages,
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
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
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    return user;
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
