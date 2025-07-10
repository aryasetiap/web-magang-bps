import { Injectable, NotFoundException } from '@nestjs/common';
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

  // 1. Implementasikan method findTasksForUser
  findTasksForUser(userId: number) {
    // Cari semua tugas di mana user ini ada di dalam daftar penugasannya
    return this.prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId: userId,
          },
        },
      },
      // Sertakan juga informasi pembuat tugas
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // 2. Implementasikan juga findAll untuk Admin/Staff
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
