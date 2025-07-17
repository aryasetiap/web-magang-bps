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
import { GradeSubmissionDto } from '../submissions/dto/grade-submission.dto'; // 1. Impor DTO
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    creatorId: number,
    createTaskDto: CreateTaskDto,
    file?: Express.Multer.File, // Tambahkan file opsional
  ) {
    const { title, description, deadline, internIds } = createTaskDto;
    let filePath: string | undefined = undefined;
    if (file) {
      filePath = file.path;
    }
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdBy: creatorId,
        filePath, // Simpan path file jika ada
      },
    });

    // Jika internIds disediakan, langsung assign
    if (internIds && internIds.length > 0) {
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

  async assignTask(taskId: number, assignTaskDto: AssignTaskDto) {
    const { internIds } = assignTaskDto;
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);
    }
    const assignmentsData = internIds.map((internId) => ({
      taskId: taskId,
      userId: internId,
    }));
    return this.prisma.taskAssignment.createMany({
      data: assignmentsData,
      skipDuplicates: true,
    });
  }

  async submitTask(userId: number, taskId: number, file: Express.Multer.File) {
    // if (!file) {
    //   throw new BadRequestException('File tugas wajib diunggah.');
    // }
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
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId: taskId,
          userId: userId,
        },
      },
    });
    if (!assignment) {
      throw new ForbiddenException(
        'Anda tidak ditugaskan untuk mengerjakan tugas ini.',
      );
    }
    const existingSubmission = await this.prisma.submission.findFirst({
      where: { taskId, userId },
    });
    if (existingSubmission) {
      throw new ConflictException('Anda sudah pernah mengumpulkan tugas ini.');
    }
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    const isLate = !!(task && new Date() > task.deadline);
    return this.prisma.submission.create({
      data: {
        filePath: file.path,
        taskId: taskId,
        userId: userId,
        status: 'submitted',
        isLate, // Tandai jika lewat deadline
      },
    });
  }

  async findSubmissionsForTask(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);
    }
    return this.prisma.submission.findMany({
      where: {
        taskId: taskId,
      },
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

  // 2. Implementasikan method gradeSubmission
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
    // Cek apakah grader adalah creator tugas
    if (submission.task.createdBy !== graderId) {
      throw new ForbiddenException('Anda tidak berhak menilai submission ini.');
    }
    // Cek status submission
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
    // Update status ke 'reviewed'
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

  findTasksForUser(userId: number, page = 1, limit = 10) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return this.prisma.task
      .findMany({
        where: {
          assignments: {
            some: { userId },
          },
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
      })
      .then((tasks) =>
        tasks.map((task) => ({
          ...task,
          // Ambil submission dengan id terbesar (terbaru)
          submission: task.submissions.length
            ? task.submissions.sort((a, b) => b.id - a.id)[0]
            : null,
          fileUrl: task.filePath
            ? `${baseUrl}/${task.filePath.replace(/\\/g, '/')}`
            : null,
        })),
      );
  }

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
    // Opsional: Cegah update jika sudah lewat deadline
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

  async remove(id: number) {
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
  }

  async isUserAssignedToTask(taskId: number, userId: number) {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    return !!assignment;
  }
}
