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

@Injectable()
export class LogbooksService {
  constructor(private prisma: PrismaService) {}

  // Method helper untuk verifikasi kepemilikan
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

  // Membuat entri logbook baru
  async create(userId: number, createLogbookDto: CreateLogbookDto) {
    // Cek apakah sudah ada logbook di tanggal yang sama untuk user ini
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
        logDate: new Date(createLogbookDto.logDate), // Konversi string tanggal ke objek Date
        content: createLogbookDto.content,
        // Status akan otomatis 'draft' karena default di skema
      },
    });
  }

  // Menemukan semua logbook milik user yang login
  findAll(userId: number) {
    return this.prisma.logbook.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        logDate: 'desc', // Urutkan dari yang terbaru
      },
    });
  }

  // Menemukan satu logbook spesifik setelah verifikasi kepemilikan
  async findOne(userId: number, id: number) {
    // Cukup panggil helper, ia akan melempar error jika tidak ditemukan atau bukan pemilik
    return this.verifyOwnership(userId, id);
  }

  // Mengupdate logbook setelah verifikasi kepemilikan
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

  // Menghapus logbook setelah verifikasi kepemilikan
  async remove(userId: number, id: number) {
    // Pastikan user adalah pemilik logbook sebelum menghapus
    await this.verifyOwnership(userId, id);

    return this.prisma.logbook.delete({
      where: { id: id },
    });
  }

  // Menemukan semua logbook untuk admin dengan paginasi
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.logbook.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' }, // Ganti dengan field tanggal jika ada, misal createdAt
        include: { user: true },
      }),
      this.prisma.logbook.count(),
    ]);
    // Filter password
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
