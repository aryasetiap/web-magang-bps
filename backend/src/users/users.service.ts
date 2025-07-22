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

/**
 * Service untuk manajemen data user.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  /**
   * Membuat user baru.
   * @param createUserDto Data user yang akan dibuat.
   * @returns Data user yang berhasil dibuat (tanpa password).
   * @throws ConflictException jika email sudah terdaftar.
   * @throws NotFoundException jika role tidak ditemukan.
   */
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, roleName } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User dengan email ${email} sudah terdaftar.`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException(`Peran '${roleName}' tidak ditemukan.`);
    }

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
      },
    });

    // Menghilangkan password dari hasil response
    const { password: _, ...result } = newUser;
    return result;
  }

  /**
   * Mengambil profil user berdasarkan ID.
   * @param id ID user.
   * @returns Data profil user.
   * @throws NotFoundException jika user tidak ditemukan.
   */
  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        educationStatus: true,
        activityType: true,
        activityStart: true,
        activityEnd: true,
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

  /**
   * Memperbarui profil user, termasuk foto profil jika ada.
   * @param id ID user.
   * @param updateProfileDto Data profil yang akan diperbarui.
   * @param profilePhoto File foto profil baru (opsional).
   * @returns Data user yang telah diperbarui.
   * @throws NotFoundException jika user tidak ditemukan.
   */
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

    const updateData: any = {
      ...updateProfileDto,
    };

    // Penanganan field baru secara eksplisit
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

    // Jika ada file foto baru, hapus foto lama dan simpan path baru
    if (profilePhoto) {
      if (user.profilePhoto) {
        const oldPhotoPath = path.resolve(user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (error) {
            console.error('Gagal menghapus foto profil lama:', error);
          }
        }
      }
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
        educationStatus: true,
        activityType: true,
        activityStart: true,
        activityEnd: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Mengambil daftar user dengan fitur paginasi.
   * @param paginationQuery Query paginasi (page, limit).
   * @returns Daftar user beserta metadata paginasi.
   */
  async findAll(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page) > 0 ? Number(paginationQuery.page) : 1;
    const limit = Number(paginationQuery.limit) > 0 ? Number(paginationQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
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
          educationStatus: true,
          activityType: true,
          activityStart: true,
          activityEnd: true,
          role: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: { deletedAt: null },
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
        totalPages,
      },
    };
  }

  /**
   * Mengambil detail user berdasarkan ID.
   * @param id ID user.
   * @returns Data user.
   * @throws NotFoundException jika user tidak ditemukan.
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
        educationStatus: true,
        activityType: true,
        activityStart: true,
        activityEnd: true,
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

  /**
   * Memperbarui data user.
   * @param id ID user.
   * @param updateUserDto Data user yang akan diperbarui.
   * @returns Data user yang telah diperbarui.
   * @throws NotFoundException jika user tidak ditemukan.
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
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
          educationStatus: true,
          activityType: true,
          activityStart: true,
          activityEnd: true,
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

  /**
   * Menghapus (soft delete) user berdasarkan ID.
   * @param id ID user.
   * @returns Data user yang telah dihapus (soft delete).
   */
  async remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
