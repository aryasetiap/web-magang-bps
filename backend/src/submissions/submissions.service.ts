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
    description?: string,
  ) {
    if (!file && (!description || description.trim() === '')) {
      throw new BadRequestException('Minimal file atau deskripsi harus diisi.');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission tidak ditemukan.');
    const task = await this.prisma.task.findUnique({
      where: { id: submission.taskId },
    });
    const isLate = !!(task && new Date() > task.deadline);

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

    // Hapus file lama jika ada dan ada file baru
    if (file && submission.filePath && fs.existsSync(submission.filePath)) {
      fs.unlinkSync(submission.filePath);
    }

    // Validasi file jika ada
    if (file) {
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
    }

    // Update submission
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        filePath: file ? file.path : submission.filePath,
        status: 'submitted',
        grade: null,
        feedback: null,
        isLate,
        description: description ?? submission.description,
      },
    });
  }

  async submit(
    taskId: number,
    userId: number,
    file: Express.Multer.File,
    description?: string,
  ) {
    if (!file && (!description || description.trim() === '')) {
      throw new BadRequestException('Minimal file atau deskripsi harus diisi.');
    }

    // Validasi file jika ada
    if (file) {
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
    }

    // Cek assignment
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (!assignment) {
      if (file) fs.unlinkSync(file.path);
      throw new ForbiddenException(
        'Anda tidak ditugaskan untuk mengerjakan tugas ini.',
      );
    }

    // Cek existing submission
    const existingSubmission = await this.prisma.submission.findFirst({
      where: { taskId, userId },
    });
    if (existingSubmission) {
      if (file) fs.unlinkSync(file.path);
      throw new BadRequestException(
        'Anda sudah pernah mengumpulkan tugas ini.',
      );
    }

    // Cek deadline
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const isLate = !!(task && new Date() > task.deadline);

    // Create submission
    return this.prisma.submission.create({
      data: {
        filePath: file ? file.path : null,
        taskId,
        userId,
        status: 'submitted',
        isLate,
        description,
      },
    });
  }
}
