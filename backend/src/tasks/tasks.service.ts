/**
 * tasks.service.ts
 *
 * Service untuk mengelola tugas, penugasan, pengumpulan, dan penilaian tugas.
 * Berisi logika utama terkait CRUD tugas, penugasan ke intern, pengumpulan tugas, dan penilaian submission.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTaskDto } from './dto/assign-task.dto';
import { GradeSubmissionDto } from '../submissions/dto/grade-submission.dto';
import * as fs from 'fs';
import { Prisma } from '@prisma/client';

/**
 * Service utama untuk pengelolaan tugas, penugasan, pengumpulan, dan penilaian.
 */
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat tugas baru dan meng-assign ke intern jika ada.
   * @param creatorId ID pembuat tugas
   * @param createTaskDto Data tugas yang akan dibuat
   * @param file File tugas (opsional)
   * @returns Data tugas yang telah dibuat
   */
  async create(
    creatorId: number,
    createTaskDto: CreateTaskDto,
    file?: Express.Multer.File,
  ) {
    const { title, description, deadline, internIds } = createTaskDto;
    let filePath: string | undefined;
    if (file) filePath = file.path;

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdBy: creatorId,
        filePath,
      },
    });

    if (internIds?.length) {
      const assignmentsData = internIds.map((internId) => ({
        taskId: task.id,
        userId: internId,
      }));
      await this.prisma.taskAssignment.createMany({
        data: assignmentsData,
        skipDuplicates: true,
      });
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'create',
        entity: 'task',
        entityId: task.id,
        userId: creatorId,
        description: `Membuat tugas "${task.title}"`,
      },
    });

    return task;
  }

  /**
   * Meng-assign tugas ke beberapa intern.
   * @param taskId ID tugas
   * @param assignTaskDto Data penugasan
   * @returns Hasil assign tugas
   */
  async assignTask(taskId: number, assignTaskDto: AssignTaskDto) {
    const { internIds } = assignTaskDto;
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task)
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);

    const assignmentsData = internIds.map((internId) => ({
      taskId,
      userId: internId,
    }));

    try {
      return await this.prisma.taskAssignment.createMany({
        data: assignmentsData,
        skipDuplicates: true,
      });
    } catch (err) {
      // Perbaikan: Tangani error Prisma P2003 (foreign key violation)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Salah satu ID intern tidak valid atau tidak ditemukan.',
        );
      }
      throw err;
    }
  }

  /**
   * Mengumpulkan tugas oleh intern.
   * @param userId ID user yang mengumpulkan
   * @param taskId ID tugas
   * @param file File hasil tugas (opsional)
   * @param description Deskripsi pengumpulan (opsional)
   * @returns Data submission yang telah dibuat
   */
  async submitTask(
    userId: number,
    taskId: number,
    file?: Express.Multer.File,
    description?: string,
  ) {
    if (!file && (!description || !description.trim())) {
      throw new BadRequestException('Minimal file atau deskripsi harus diisi.');
    }

    if (file) {
      this.validateSubmissionFile(file);
    }

    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (!assignment) {
      if (file) fs.unlinkSync(file.path);
      throw new ForbiddenException(
        'Anda tidak ditugaskan untuk mengerjakan tugas ini.',
      );
    }

    const existingSubmission = await this.prisma.submission.findFirst({
      where: { taskId, userId },
    });
    if (existingSubmission) {
      if (file) fs.unlinkSync(file.path);
      throw new ConflictException('Anda sudah pernah mengumpulkan tugas ini.');
    }

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
   * Validasi file submission (tipe dan ukuran).
   * @param file File yang diupload
   */
  private validateSubmissionFile(file: Express.Multer.File) {
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

  /**
   * Mengambil semua submission untuk suatu tugas.
   * @param taskId ID tugas
   * @returns Daftar submission beserta data user
   */
  async findSubmissionsForTask(taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task)
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);

    return this.prisma.submission.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            name: true,
            namaLengkap: true,
          },
        },
      },
    });
  }

  /**
   * Memberikan penilaian pada submission.
   * @param submissionId ID submission
   * @param gradeSubmissionDto Data penilaian
   * @param graderId ID user penilai (harus creator tugas)
   * @returns Submission yang sudah dinilai
   */
  async gradeSubmission(
    submissionId: number,
    gradeSubmissionDto: GradeSubmissionDto,
    graderId: number,
  ) {
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
      await this.prisma.notification.create({
        data: {
          userId: updated.userId,
          message: 'Submission Anda perlu revisi.',
        },
      });
      return updated;
    }

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

    await this.prisma.notification.create({
      data: {
        userId: updated.userId,
        message: 'Submission Anda telah dinilai.',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'grade',
        entity: 'submission',
        entityId: submissionId,
        userId: graderId,
        description: `Submission dinilai dengan status ${gradeSubmissionDto.status || 'reviewed'}`,
      },
    });

    return updated;
  }

  /**
   * Mengambil daftar tugas yang diassign ke user tertentu, beserta status submission terakhir.
   * @param userId ID user
   * @param page Halaman (opsional)
   * @param limit Jumlah per halaman (opsional)
   * @returns Daftar tugas beserta submission terakhir
   */
  async findTasksForUser(userId: number, page = 1, limit = 10) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const tasks = await this.prisma.task.findMany({
      where: {
        assignments: { some: { userId } },
        deletedAt: null,
      },
      include: {
        creator: { select: { name: true } },
        submissions: {
          where: { userId },
          select: {
            id: true,
            status: true,
            grade: true,
            feedback: true,
            isLate: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { deadline: 'asc' },
    });

    return tasks.map((task) => ({
      ...task,
      submission: task.submissions.length
        ? task.submissions.sort((a, b) => b.id - a.id)[0]
        : null,
      fileUrl: task.filePath
        ? `${baseUrl}/${task.filePath.replace(/\\/g, '/')}`
        : null,
    }));
  }

  /**
   * Mengambil semua tugas yang belum dihapus.
   * @returns Daftar tugas
   */
  async findAll() {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const tasks = await this.prisma.task.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        createdBy: true,
        filePath: true,
      },
    });

    return {
      data: tasks.map((task) => ({
        ...task,
        fileUrl: task.filePath
          ? `${baseUrl}/${task.filePath.replace(/\\/g, '/')}`
          : null,
      })),
    };
  }

  /**
   * Mengambil detail satu tugas berdasarkan ID.
   * @param id ID tugas
   * @returns Data tugas
   */
  async findOne(id: number) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        createdBy: true,
        filePath: true,
        deletedAt: true,
      },
    });
    if (!task || task.deletedAt)
      throw new NotFoundException('Task tidak ditemukan');
    return {
      ...task,
      fileUrl: task.filePath
        ? `${baseUrl}/${task.filePath.replace(/\\/g, '/')}`
        : null,
    };
  }

  /**
   * Mengupdate data tugas jika belum melewati deadline.
   * @param id ID tugas
   * @param updateTaskDto Data update tugas
   * @returns Data tugas yang sudah diupdate
   */
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        deletedAt: true,
        deadline: true,
      },
    });
    if (!task || task.deletedAt) {
      throw new NotFoundException('Task tidak ditemukan atau sudah dihapus.');
    }
    if (task.deadline && new Date() > task.deadline) {
      throw new BadRequestException(
        'Task sudah melewati deadline dan tidak bisa diubah.',
      );
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        deadline: updateTaskDto.deadline
          ? new Date(updateTaskDto.deadline)
          : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'update',
        entity: 'task',
        entityId: id,
        userId: updated.createdBy,
        description: `Update tugas "${updated.title}"`,
      },
    });

    return updated;
  }

  /**
   * Melakukan soft delete pada tugas.
   * @param id ID tugas
   * @returns Data tugas yang sudah dihapus
   */
  async remove(id: number) {
    try {
      const deleted = await this.prisma.task.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'delete',
          entity: 'task',
          entityId: id,
          userId: deleted.createdBy,
          description: `Soft delete tugas "${deleted.title}"`,
        },
      });

      return deleted;
    } catch (err) {
      // Perbaikan: Tangani error Prisma P2025 (task tidak ditemukan)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Task tidak ditemukan');
      }
      throw err;
    }
  }

  /**
   * Mengecek apakah user sudah diassign ke tugas tertentu.
   * @param taskId ID tugas
   * @param userId ID user
   * @returns True jika user sudah diassign, false jika tidak
   */
  async isUserAssignedToTask(taskId: number, userId: number): Promise<boolean> {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    return !!assignment;
  }
}
