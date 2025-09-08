/**
 * Modul service untuk mengelola data Final Project.
 * Berisi operasi CRUD, upload file, dan proses review final project.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinalProjectDto } from './dto/create-final-project.dto';
import { UpdateFinalProjectDto } from './dto/update-final-project.dto';
import { ReviewFinalProjectDto } from './dto/review-final-project.dto';
import { FinalProject, Prisma } from '@prisma/client';
import * as fs from 'fs';
import { Response } from 'express';

/**
 * Service untuk mengelola data Final Project.
 * Menyediakan operasi pembuatan, pembacaan, pembaruan, penghapusan, dan review final project.
 */
@Injectable()
export class FinalProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat final project baru untuk user tertentu.
   * @param userId ID user yang membuat final project
   * @param createFinalProjectDto Data final project yang akan dibuat
   * @param file File yang diupload (opsional)
   * @returns Data final project yang telah dibuat
   */
  async create(
    userId: number,
    createFinalProjectDto: CreateFinalProjectDto,
    file?: Express.Multer.File,
  ): Promise<FinalProject> {
    const data: Prisma.FinalProjectUncheckedCreateInput = {
      title: createFinalProjectDto.title,
      description: createFinalProjectDto.description,
      userId,
      status: file ? 'submitted' : 'draft',
      ...(file && {
        filePath: file.path,
        submittedAt: new Date(),
      }),
    };

    return this.prisma.finalProject.create({ data });
  }

  /**
   * Mengambil seluruh final project milik user tertentu.
   * @param userId ID user
   * @returns Daftar final project milik user
   */
  async findAllForUser(userId: number): Promise<FinalProject[]> {
    return this.prisma.finalProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mengambil seluruh final project untuk admin dengan paginasi.
   * @param page Halaman yang diambil (default: 1)
   * @param limit Jumlah data per halaman (default: 20)
   * @returns Data final project beserta informasi paginasi
   */
  async findAllForAdmin(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: FinalProject[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.finalProject.findMany({
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isGraduated: true,
            },
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

  /**
   * Mengambil detail final project berdasarkan ID.
   * Jika userId diberikan, hanya mengizinkan akses ke final project milik user tersebut.
   * @param id ID final project
   * @param userId (Opsional) ID user yang meminta data
   * @returns Data final project
   * @throws NotFoundException jika final project tidak ditemukan
   * @throws ForbiddenException jika user tidak berhak mengakses data
   */
  async findOne(
    id: number,
    userId?: number,
  ): Promise<
    FinalProject & {
      user: { id: number; name: string; email: string };
      reviewedBy: { id: number; name: string } | null;
    }
  > {
    const project = await this.prisma.finalProject.findUnique({
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

    if (!project) {
      throw new NotFoundException('Final project tidak ditemukan');
    }

    if (userId && project.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke final project ini',
      );
    }

    return project;
  }

  /**
   * Memperbarui data final project milik user tertentu.
   * Hanya dapat dilakukan jika status bukan 'accepted'.
   * @param id ID final project
   * @param userId ID user pemilik final project
   * @param updateFinalProjectDto Data yang akan diperbarui
   * @param file File baru yang diupload (opsional)
   * @returns Data final project yang telah diperbarui
   * @throws ForbiddenException jika status sudah 'accepted'
   */
  async update(
    id: number,
    userId: number,
    updateFinalProjectDto: UpdateFinalProjectDto,
    file?: Express.Multer.File,
  ): Promise<FinalProject> {
    const project = await this.findOne(id, userId);

    const updateData: Prisma.FinalProjectUncheckedUpdateInput = {
      ...updateFinalProjectDto,
    };

    if (file) {
      if (project.filePath && fs.existsSync(project.filePath)) {
        fs.unlinkSync(project.filePath);
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

  /**
   * Melakukan review terhadap final project.
   * Hanya dapat direview jika status saat ini adalah 'submitted'.
   * @param id ID final project
   * @param reviewerId ID reviewer (admin/dosen)
   * @param reviewDto Data review (status, grade, feedback)
   * @returns Data final project yang telah direview
   * @throws ForbiddenException jika status bukan 'submitted'
   */
  async review(
    id: number,
    reviewerId: number,
    reviewDto: ReviewFinalProjectDto,
  ): Promise<FinalProject> {
    const finalProject = await this.findOne(id);

    if (finalProject.status !== 'submitted') {
      throw new ForbiddenException(
        'Hanya final project yang sudah disubmit yang dapat direview',
      );
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

  /**
   * Menghapus final project milik user tertentu beserta file yang terkait (jika ada).
   * @param id ID final project
   * @param userId ID user pemilik final project
   * @returns Data final project yang telah dihapus
   * @throws NotFoundException atau ForbiddenException jika tidak ditemukan atau tidak berhak
   */
  async remove(id: number, userId: number): Promise<FinalProject> {
    const finalProject = await this.findOne(id, userId);

    if (finalProject.filePath && fs.existsSync(finalProject.filePath)) {
      fs.unlinkSync(finalProject.filePath);
    }

    return this.prisma.finalProject.delete({
      where: { id },
    });
  }

  /**
   * Mengunduh file final project.
   * Hanya dapat diakses oleh admin atau pemilik project.
   * @param id ID final project
   * @param userId ID user (undefined jika admin)
   * @param res Response Express untuk mengirim file
   */
  async download(
    id: number,
    userId: number | undefined,
    res: Response,
  ): Promise<any> {
    // Cari project dan cek hak akses
    const project = await this.findOne(id, userId);

    if (!project.filePath || !fs.existsSync(project.filePath)) {
      throw new NotFoundException('File final project tidak ditemukan');
    }

    // Set header dan kirim file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="final-project-${project.id}.pdf"`,
    );
    const stream = fs.createReadStream(project.filePath);
    stream.pipe(res);
  }
}
