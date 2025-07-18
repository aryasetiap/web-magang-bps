import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // [MODIFIKASI] Implementasikan method create
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, roleName } = createUserDto;

    // 1. Cek apakah email sudah ada
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User dengan email ${email} sudah terdaftar.`,
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Cari role berdasarkan nama
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException(`Peran '${roleName}' tidak ditemukan.`);
    }

    // 4. Buat user baru
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
    });

    // 5. Kembalikan data user tanpa password
    const { password: _, ...result } = newUser;
    return result;
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true, // Tambahkan field ini
        namaLengkap: true,
        nimNisn: true,
        asalInstitusi: true,
        jurusanProdi: true,
        nomorTelepon: true,
        alamat: true,
        educationStatus: true, // <-- field baru
        activityType: true, // <-- field baru
        activityStart: true, // <-- field baru
        activityEnd: true, // <-- field baru
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
    }

    return user;
  }

  // Method baru untuk update profile dengan foto
  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
    profilePhoto?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { profilePhoto: true },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
    }

    // Update data
    const updateData: any = {
      ...updateProfileDto,
    };

    // Handle field baru secara eksplisit jika perlu
    if (typeof updateProfileDto.educationStatus !== 'undefined') {
      updateData.educationStatus = updateProfileDto.educationStatus;
    }
    if (typeof updateProfileDto.activityType !== 'undefined') {
      updateData.activityType = updateProfileDto.activityType;
    }
    if (typeof updateProfileDto.activityStart !== 'undefined') {
      updateData.activityStart = updateProfileDto.activityStart
        ? new Date(updateProfileDto.activityStart)
        : null;
    }
    if (typeof updateProfileDto.activityEnd !== 'undefined') {
      updateData.activityEnd = updateProfileDto.activityEnd
        ? new Date(updateProfileDto.activityEnd)
        : null;
    }

    // Jika ada file foto baru
    if (profilePhoto) {
      // Hapus foto lama jika ada dan file exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.resolve(user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (error) {
            console.error('Error deleting old profile photo:', error);
          }
        }
      }

      // Simpan path foto baru (relative path)
      updateData.profilePhoto = profilePhoto.path.replace(/\\/g, '/');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        namaLengkap: true,
        nimNisn: true,
        asalInstitusi: true,
        jurusanProdi: true,
        nomorTelepon: true,
        alamat: true,
        educationStatus: true, // <-- field baru
        activityType: true, // <-- field baru
        activityStart: true, // <-- field baru
        activityEnd: true, // <-- field baru
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return updatedUser;
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

  remove(id: number) {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
