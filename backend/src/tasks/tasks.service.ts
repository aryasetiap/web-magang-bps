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

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId: number, createTaskDto: CreateTaskDto) {
    const { title, description, deadline, internIds } = createTaskDto;
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        createdBy: creatorId,
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
    if (!file) {
      throw new BadRequestException('File tugas wajib diunggah.');
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
      where: {
        taskId: taskId,
        userId: userId,
      },
    });
    if (existingSubmission) {
      throw new ConflictException('Anda sudah pernah mengumpulkan tugas ini.');
    }
    return this.prisma.submission.create({
      data: {
        filePath: file.path,
        taskId: taskId,
        userId: userId,
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
  ) {
    // Gunakan update untuk mengisi nilai dan feedback pada submission yang ada
    return this.prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        grade: gradeSubmissionDto.grade,
        feedback: gradeSubmissionDto.feedback,
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
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
