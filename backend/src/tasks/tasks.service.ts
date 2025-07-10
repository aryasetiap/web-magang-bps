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

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  create(creatorId: number, createTaskDto: CreateTaskDto) {
    const { title, description, deadline } = createTaskDto;
    return this.prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdBy: creatorId,
      },
    });
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

  // 1. Implementasikan method submitTask
  async submitTask(userId: number, taskId: number, file: Express.Multer.File) {
    // Validasi 1: Pastikan file diunggah
    if (!file) {
      throw new BadRequestException('File tugas wajib diunggah.');
    }

    // Validasi 2: Cek apakah intern ini benar-benar ditugaskan untuk tugas ini
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

    // Validasi 3: Cek apakah intern sudah pernah mengumpulkan tugas ini
    const existingSubmission = await this.prisma.submission.findFirst({
      where: {
        taskId: taskId,
        userId: userId,
      },
    });

    if (existingSubmission) {
      throw new ConflictException('Anda sudah pernah mengumpulkan tugas ini.');
    }

    // Jika semua validasi lolos, buat record submission baru
    return this.prisma.submission.create({
      data: {
        filePath: file.path,
        taskId: taskId,
        userId: userId,
        // submittedAt akan diisi otomatis oleh @default(now())
      },
    });
  }

  // 1. Implementasikan method findSubmissionsForTask
  async findSubmissionsForTask(taskId: number) {
    // Opsional: Verifikasi dulu apakah tugasnya ada
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);
    }

    // Cari semua submission untuk taskId ini
    return this.prisma.submission.findMany({
      where: {
        taskId: taskId,
      },
      // Sertakan juga nama intern yang mengumpulkan
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

  findTasksForUser(userId: number) {
    return this.prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.task.findMany({
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
