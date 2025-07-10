import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLogbookDto } from './dto/create-logbook.dto';
import { UpdateLogbookDto } from './dto/update-logbook.dto';
import { PrismaService } from '../prisma/prisma.service';

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
  create(userId: number, createLogbookDto: CreateLogbookDto) {
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
    // Pastikan user adalah pemilik logbook sebelum mengupdate
    await this.verifyOwnership(userId, id);

    return this.prisma.logbook.update({
      where: { id: id },
      data: {
        ...updateLogbookDto,
        // Jika ada tanggal, konversi ke objek Date
        ...(updateLogbookDto.logDate && {
          logDate: new Date(updateLogbookDto.logDate),
        }),
      },
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
}
