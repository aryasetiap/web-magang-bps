import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTaskDto } from './dto/assign-task.dto'; // 1. Impor DTO

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // 2. Implementasikan method assignTask
  async assignTask(taskId: number, assignTaskDto: AssignTaskDto) {
    const { internIds } = assignTaskDto;

    // Opsional: Verifikasi apakah tugasnya ada
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Tugas dengan ID ${taskId} tidak ditemukan.`);
    }

    // Siapkan data untuk dimasukkan ke tabel TaskAssignment
    const assignmentsData = internIds.map((internId) => ({
      taskId: taskId,
      userId: internId,
    }));

    // Gunakan createMany untuk membuat beberapa record sekaligus secara efisien
    return this.prisma.taskAssignment.createMany({
      data: assignmentsData,
      skipDuplicates: true, // Jika penugasan sudah ada, lewati (tidak error)
    });
  }

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

  findAll() {
    return `This action returns all tasks`;
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
