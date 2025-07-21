import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StatusLogbook } from '@prisma/client';

/**
 * Service untuk mengelola entri logbook.
 */
@Injectable()
export class LogbooksService {
  constructor(private prisma: PrismaService) { }

  /**
   * Memverifikasi apakah user adalah pemilik logbook tertentu.
   * @param userId ID user yang sedang login
   * @param logbookId ID logbook yang akan diverifikasi
   * @throws NotFoundException jika logbook tidak ditemukan
   * @throws ForbiddenException jika user bukan pemilik logbook
   * @returns Data logbook yang diverifikasi
   */
  private async verifyOwnership(userId: number, logbookId: number) {
    const logbook = await this.prisma.logbook.findUnique({
      where: { id: logbookId },
    });

    if (!logbook) {
      throw new NotFoundException(
        `Logbook dengan ID ${logbookId} tidak ditemukan.`,
      );
    }

    if (logbook.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki izin untuk mengakses logbook ini.',
      );
    }
    return logbook;
  }

  /**
   * Membuat entri logbook baru untuk user tertentu.
   * @param userId ID user yang membuat logbook
   * @param createLogbookDto Data logbook yang akan dibuat
   * @throws BadRequestException jika sudah ada logbook di tanggal yang sama
   * @returns Data logbook yang berhasil dibuat
   */
  async create(userId: number, createLogbookDto: CreateLogbookDto) {
    const existing = await this.prisma.logbook.findFirst({
      where: {
        userId: userId,
        logDate: new Date(createLogbookDto.logDate),
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Anda sudah mengisi logbook untuk tanggal ini.',
      );
    }

    return this.prisma.logbook.create({
      data: {
        userId: userId,
        logDate: new Date(createLogbookDto.logDate),
        content: createLogbookDto.content,
      },
    });
  }

  /**
   * Mengambil semua logbook milik user tertentu.
   * @param userId ID user yang ingin diambil logbook-nya
   * @returns Daftar logbook milik user
   */
  findAll(userId: number) {
    return this.prisma.logbook.findMany({
      where: { userId: userId },
      orderBy: { logDate: 'desc' },
    });
  }

  /**
   * Mengambil satu logbook berdasarkan ID setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin diambil
   * @throws NotFoundException atau ForbiddenException jika tidak berhak
   * @returns Data logbook yang ditemukan
   */
  async findOne(userId: number, id: number) {
    return this.verifyOwnership(userId, id);
  }

  /**
   * Memperbarui data logbook setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin diperbarui
   * @param updateLogbookDto Data baru untuk logbook
   * @returns Data logbook yang telah diperbarui
   */
  async update(userId: number, id: number, updateLogbookDto: UpdateLogbookDto) {
    await this.verifyOwnership(userId, id);

    const data: any = {};
    if (updateLogbookDto.logDate) {
      data.logDate = new Date(updateLogbookDto.logDate);
    }
    if (updateLogbookDto.content) {
      data.content = updateLogbookDto.content;
    }
    if (updateLogbookDto.status) {
      data.status = updateLogbookDto.status as StatusLogbook;
    }

    return this.prisma.logbook.update({
      where: { id: id },
      data,
    });
  }

  /**
   * Menghapus logbook setelah verifikasi kepemilikan.
   * @param userId ID user yang sedang login
   * @param id ID logbook yang ingin dihapus
   * @returns Data logbook yang telah dihapus
   */
  async remove(userId: number, id: number) {
    await this.verifyOwnership(userId, id);

    return this.prisma.logbook.delete({
      where: { id: id },
    });
  }

  /**
   * Mengambil semua logbook untuk admin dengan paginasi.
   * @param page Halaman yang ingin diambil (default: 1)
   * @param limit Jumlah data per halaman (default: 20)
   * @returns Objek berisi data logbook, total data, halaman saat ini, dan halaman terakhir
   */
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.logbook.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { user: true },
      }),
      this.prisma.logbook.count(),
    ]);
    // Menghilangkan field password pada data user
    const filteredData = data.map((item) => ({
      ...item,
      user: {
        ...item.user,
        password: undefined,
      },
    }));
    return {
      data: filteredData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
