import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service'; // 1. Impor PrismaService

@Injectable()
export class TasksService {
  // 2. Suntikkan PrismaService melalui constructor
  constructor(private prisma: PrismaService) {}

  // 3. Implementasikan method create
  create(creatorId: number, createTaskDto: CreateTaskDto) {
    const { title, description, deadline } = createTaskDto;

    return this.prisma.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline), // Konversi string tanggal ke objek Date
        createdBy: creatorId, // Simpan ID pembuat tugas
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
