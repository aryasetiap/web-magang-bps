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

  // Create final project
  async create(
    userId: number,
    createFinalProjectDto: CreateFinalProjectDto,
    file?: Express.Multer.File,
  ) {
    return this.prisma.finalProject.create({
      data: {
        title: createFinalProjectDto.title,
        description: createFinalProjectDto.description,
        filePath: file?.path,
        userId,
        status: file ? 'submitted' : 'draft',
        submittedAt: file ? new Date() : null,
      },
    });
  }

  // Get all final projects for current user
  async findByUser(userId: number) {
    return this.prisma.finalProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // Get all final projects for admin
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.finalProject.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  // Get final project by ID
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

    // If userId provided, check if user owns the project
    if (userId && finalProject.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke final project ini',
      );
    }

    return finalProject;
  }

  // Update final project (only by owner)
  async update(
    id: number,
    userId: number,
    updateFinalProjectDto: UpdateFinalProjectDto,
    file?: Express.Multer.File,
  ) {
    const finalProject = await this.findOne(id, userId);

    // Check if can be updated
    if (finalProject.status === 'accepted') {
      throw new ForbiddenException(
        'Final project yang sudah diterima tidak dapat diubah',
      );
    }

    // Delete old file if new file uploaded
    if (file && finalProject.filePath && fs.existsSync(finalProject.filePath)) {
      fs.unlinkSync(finalProject.filePath);
    }

    return this.prisma.finalProject.update({
      where: { id },
      data: {
        title: updateFinalProjectDto.title,
        description: updateFinalProjectDto.description,
        filePath: file?.path || finalProject.filePath,
        status: file ? 'submitted' : finalProject.status,
        submittedAt: file ? new Date() : finalProject.submittedAt,
      },
    });
  }

  // Review final project (admin only)
  async review(
    id: number,
    reviewerId: number,
    reviewFinalProjectDto: ReviewFinalProjectDto,
  ) {
    const finalProject = await this.findOne(id);

    if (finalProject.status !== 'submitted') {
      throw new ForbiddenException(
        'Hanya final project yang sudah disubmit yang dapat direview',
      );
    }

    return this.prisma.finalProject.update({
      where: { id },
      data: {
        status: reviewFinalProjectDto.status,
        grade: reviewFinalProjectDto.grade,
        feedback: reviewFinalProjectDto.feedback,
        reviewerId,
        reviewedAt: new Date(),
      },
    });
  }

  // Delete final project
  async remove(id: number, userId: number) {
    const finalProject = await this.findOne(id, userId);

    // Delete file if exists
    if (finalProject.filePath && fs.existsSync(finalProject.filePath)) {
      fs.unlinkSync(finalProject.filePath);
    }

    return this.prisma.finalProject.delete({
      where: { id },
    });
  }
}
