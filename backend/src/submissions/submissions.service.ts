/**
 * Modul SubmissionsService
 * -----------------------------------------
 * Berisi service untuk mengelola proses submission tugas oleh user,
 * termasuk validasi file, assignment, deadline, dan hak akses user.
 */

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

/**
 * Service untuk mengelola submission tugas oleh user.
 */
@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Melakukan unggah ulang (resubmit) submission tugas oleh user.
   * Melakukan validasi file, status submission, dan hak akses user sebelum update.
   *
   * @param submissionId - ID submission yang akan diunggah ulang
   * @param userId - ID user yang melakukan resubmit
   * @param file - File baru yang diunggah (opsional)
   * @param description - Deskripsi baru submission (opsional)
   * @throws BadRequestException jika file/deskripsi tidak diisi atau file tidak valid
   * @throws NotFoundException jika submission tidak ditemukan
   * @throws ForbiddenException jika user tidak berhak atau status tidak sesuai
   * @returns Submission yang telah diperbarui
   */
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
    if (!submission) {
      throw new NotFoundException('Submission tidak ditemukan.');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak berhak mengubah submission ini.',
      );
    }

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

    const task = await this.prisma.task.findUnique({
      where: { id: submission.taskId },
    });
    const isLate = !!(task && new Date() > task.deadline);

    if (file) {
      this.validateFile(file);

      // Hapus file lama jika ada file baru yang diunggah
      if (submission.filePath && fs.existsSync(submission.filePath)) {
        fs.unlinkSync(submission.filePath);
      }
    }

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

  /**
   * Melakukan submit tugas baru oleh user.
   * Melakukan validasi file, assignment, dan deadline sebelum create.
   *
   * @param taskId - ID tugas yang akan dikumpulkan
   * @param userId - ID user yang melakukan submit
   * @param file - File yang diunggah (opsional)
   * @param description - Deskripsi submission (opsional)
   * @throws BadRequestException jika file/deskripsi tidak diisi atau file tidak valid
   * @throws ForbiddenException jika user tidak ditugaskan
   * @returns Submission yang telah dibuat
   */
  async submit(
    taskId: number,
    userId: number,
    file: Express.Multer.File,
    description?: string,
  ) {
    if (!file && (!description || description.trim() === '')) {
      throw new BadRequestException('Minimal file atau deskripsi harus diisi.');
    }

    if (file) {
      this.validateFile(file);
    }

    // Cek apakah user ditugaskan pada tugas ini
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (!assignment) {
      if (file) fs.unlinkSync(file.path);
      throw new ForbiddenException(
        'Anda tidak ditugaskan untuk mengerjakan tugas ini.',
      );
    }

    // Cek apakah sudah pernah submit tugas ini
    const existingSubmission = await this.prisma.submission.findFirst({
      where: { taskId, userId },
    });
    if (existingSubmission) {
      if (file) fs.unlinkSync(file.path);
      throw new BadRequestException(
        'Anda sudah pernah mengumpulkan tugas ini.',
      );
    }

    // Cek apakah submit dilakukan setelah deadline
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const isLate = !!(task && new Date() > task.deadline);

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

  /**
   * Memberikan penilaian pada submission.
   * @param submissionId ID submission
   * @param gradeSubmissionDto Data penilaian
   * @param graderId ID user penilai
   * @returns Submission yang sudah dinilai
   */
  async grade(
    submissionId: number,
    gradeSubmissionDto: GradeSubmissionDto,
    graderId: number,
  ) {
    // Cek submission dan hak akses
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true },
    });
    if (!submission) throw new NotFoundException('Submission tidak ditemukan.');
    if (submission.task.createdBy !== graderId) {
      throw new ForbiddenException('Anda tidak berhak menilai submission ini.');
    }
    if (!['submitted', 'revisi'].includes(submission.status)) {
      throw new BadRequestException(
        'Submission hanya bisa dinilai jika status submitted/revisi.',
      );
    }

    // Jika status revisi, update status dan feedback saja
    if (gradeSubmissionDto.status === 'revisi') {
      const updated = await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          feedback: gradeSubmissionDto.feedback,
          status: 'revisi',
          gradedBy: graderId,
          gradedAt: new Date(),
        },
      });
      // Notifikasi dan audit log bisa ditambahkan di sini jika perlu
      return updated;
    }

    // Jika status reviewed, update grade, feedback, status
    const updated = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: gradeSubmissionDto.grade,
        feedback: gradeSubmissionDto.feedback,
        status: 'reviewed',
        gradedBy: graderId,
        gradedAt: new Date(),
      },
    });
    // Notifikasi dan audit log bisa ditambahkan di sini jika perlu
    return updated;
  }

  /**
   * Melakukan validasi file yang diunggah.
   * Mengecek tipe file dan ukuran file.
   *
   * @param file - File yang akan divalidasi
   * @throws BadRequestException jika file tidak valid
   */
  private validateFile(file: Express.Multer.File): void {
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
}
