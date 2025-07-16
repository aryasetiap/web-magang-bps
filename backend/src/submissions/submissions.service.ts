import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  // ...method lain...

  async resubmit(
    submissionId: number,
    userId: number,
    file: Express.Multer.File,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission tidak ditemukan.');
    const task = await this.prisma.task.findUnique({
      where: { id: submission.taskId },
    });
    const isLate = !!(task && new Date() > task.deadline);

    if (!submission) throw new NotFoundException('Submission tidak ditemukan.');
    if (submission.userId !== userId)
      throw new ForbiddenException(
        'Anda tidak berhak mengubah submission ini.',
      );
    if (!['revisi', 'submitted'].includes(submission.status)) {
      throw new ForbiddenException(
        'Submission tidak dapat diunggah ulang pada status ini.',
      );
    }
    if (submission.status === 'reviewed') {
      throw new ForbiddenException(
        'Submission sudah dinilai dan tidak bisa diubah.',
      );
    }

    // Hapus file lama jika ada
    if (submission.filePath && fs.existsSync(submission.filePath)) {
      fs.unlinkSync(submission.filePath);
    }

    // Validasi tipe dan ukuran file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      throw new BadRequestException(
        'Tipe file tidak didukung. Hanya PDF/DOC/DOCX.',
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Ukuran file melebihi 5MB.');
    }

    // Update submission dengan file baru dan status submitted (atau revisi jika ingin)
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        filePath: file.path,
        status: 'submitted',
        grade: null,
        feedback: null,
        isLate, // pastikan isLate sudah boolean, bukan null
      },
    });
  }
}
