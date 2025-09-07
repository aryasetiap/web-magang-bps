/**
 * Modul service untuk manajemen data user pada aplikasi.
 * Berisi operasi CRUD, pengelolaan profil, dan paginasi user.
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
// Hapus import Prisma yang tidak digunakan secara langsung sebagai tipe di sini
// import { Prisma } from '@prisma/client';
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
 * Menyediakan fitur pembuatan, pembaruan, penghapusan, dan pengambilan data user.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = newUser;
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
      select: this.profileSelect(),
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

    const updateData = this.buildUpdateProfileData(updateProfileDto);

    if (profilePhoto) {
      this.deleteOldProfilePhoto(user.profilePhoto ?? undefined);
      updateData.profilePhoto = profilePhoto.path.replace(/\\/g, '/');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: this.profileSelect(),
    });

    return updatedUser;
  }

  /**
   * Mengambil daftar user dengan fitur paginasi.
   * @param paginationQuery Query paginasi (page, limit).
   * @returns Daftar user beserta metadata paginasi.
   */
  async findAll(paginationQuery: PaginationQueryDto) {
    const page =
      Number(paginationQuery.page) > 0 ? Number(paginationQuery.page) : 1;
    const limit =
      Number(paginationQuery.limit) > 0 ? Number(paginationQuery.limit) : 10;
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: this.profileSelect(),
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
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
      where: { id, deletedAt: null },
      select: this.profileSelect(),
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
        select: this.profileSelect(),
      });
    } catch (error) {
      // FIX: Mengubah cara pengecekan error agar lebih robust dan tidak
      // bergantung pada 'instanceof' yang bermasalah di Jest.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
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
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Membantu membangun objek data untuk update profil user.
   * @param dto Data profil yang akan diperbarui.
   * @returns Objek data update untuk Prisma.
   */
  private buildUpdateProfileData(dto: UpdateProfileDto) {
    const updateData: Partial<UpdateProfileDto> & {
      educationStatus?: string;
      activityType?: string;
      activityStart?: Date | null;
      activityEnd?: Date | null;
      profilePhoto?: string;
    } = { ...dto };

    if (typeof dto.educationStatus !== 'undefined') {
      updateData.educationStatus = dto.educationStatus;
    }
    if (typeof dto.activityType !== 'undefined') {
      updateData.activityType = dto.activityType;
    }
    if (typeof dto.activityStart !== 'undefined') {
      updateData.activityStart = dto.activityStart
        ? new Date(dto.activityStart)
        : undefined;
    }
    if (typeof dto.activityEnd !== 'undefined') {
      updateData.activityEnd = dto.activityEnd
        ? new Date(dto.activityEnd)
        : undefined;
    }

    return updateData;
  }

  /**
   * Menghapus foto profil lama dari sistem file jika ada.
   * @param oldPhotoPath Path foto profil lama.
   */
  private deleteOldProfilePhoto(oldPhotoPath?: string) {
    if (oldPhotoPath) {
      const resolvedPath = path.resolve(oldPhotoPath);
      if (fs.existsSync(resolvedPath)) {
        try {
          fs.unlinkSync(resolvedPath);
        } catch (error) {
          console.error('Gagal menghapus foto profil lama:', error);
        }
      }
    }
  }

  /**
   * Mendefinisikan field yang diambil pada operasi select user.
   * @returns Objek select untuk Prisma.
   */
  private profileSelect() {
    return {
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
      isGraduated: true,
      role: { select: { name: true } },
    };
  }
}
