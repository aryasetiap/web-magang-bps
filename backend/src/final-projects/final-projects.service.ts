import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinalProjectDto } from './dto/create-final-project.dto';
import { UpdateFinalProjectDto } from './dto/update-final-project.dto';
import { ReviewFinalProjectDto } from './dto/review-final-project.dto';
import * as fs from 'fs';

@Injectable()
export class FinalProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createFinalProjectDto: CreateFinalProjectDto,
    file?: Express.Multer.File,
  ) {
    const data: any = {
      title: createFinalProjectDto.title,
      description: createFinalProjectDto.description,
      userId,
    };

    if (file) {
      data.filePath = file.path;
      data.status = 'submitted';
      data.submittedAt = new Date();
    } else {
      data.status = 'draft';
    }

    return this.prisma.finalProject.create({ data });
  }

  async findAllForUser(userId: number) {
    return this.prisma.finalProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.finalProject.findMany({
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          reviewedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.finalProject.count(),
    ]);
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId?: number) {
    const finalProject = await this.prisma.finalProject.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!finalProject) {
      throw new NotFoundException('Final project tidak ditemukan');
    }

    // Jika userId diberikan, pastikan user hanya bisa akses miliknya
    if (userId && finalProject.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke final project ini',
      );
    }

    return finalProject;
  }

  async update(
    id: number,
    userId: number,
    updateFinalProjectDto: UpdateFinalProjectDto,
    file?: Express.Multer.File,
  ) {
    const finalProject = await this.findOne(id, userId);

    // Hanya bisa update jika status draft, revisi, atau submitted
    if (['accepted'].includes(finalProject.status)) {
      throw new ForbiddenException(
        'Final project yang sudah diterima tidak dapat diubah',
      );
    }

    const updateData: any = {
      ...updateFinalProjectDto,
    };

    // Jika ada file baru, hapus file lama dan update path
    if (file) {
      if (finalProject.filePath && fs.existsSync(finalProject.filePath)) {
        fs.unlinkSync(finalProject.filePath);
      }
      updateData.filePath = file.path;
      updateData.status = 'submitted';
      updateData.submittedAt = new Date();
    }

    return this.prisma.finalProject.update({
      where: { id },
      data: updateData,
    });
  }

  async review(
    id: number,
    reviewerId: number,
    reviewDto: ReviewFinalProjectDto,
  ) {
    const finalProject = await this.findOne(id);

    if (finalProject.status !== 'submitted') {
      throw new ForbiddenException(
        'Hanya final project yang sudah disubmit yang dapat direview',
      );
    }

    if (reviewDto.status === 'revisi') {
      return this.prisma.finalProject.update({
        where: { id },
        data: {
          status: 'revisi', // enum prisma untuk final project
          grade: reviewDto.grade,
          feedback: reviewDto.feedback,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });
    }

    return this.prisma.finalProject.update({
      where: { id },
      data: {
        status: reviewDto.status,
        grade: reviewDto.grade,
        feedback: reviewDto.feedback,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });
  }

  async remove(id: number, userId: number) {
    const finalProject = await this.findOne(id, userId);

    // Hapus file jika ada
    if (finalProject.filePath && fs.existsSync(finalProject.filePath)) {
      fs.unlinkSync(finalProject.filePath);
    }

    return this.prisma.finalProject.delete({
      where: { id },
    });
  }
}
