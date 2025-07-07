// src/internship-applications/internship-applications.service.ts

import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { PrismaService } from '../prisma/prisma.service'; // 1. Impor PrismaService

@Injectable()
export class InternshipApplicationsService {
  // 2. Suntikkan PrismaService melalui constructor
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createInternshipApplicationDto: CreateInternshipApplicationDto,
    files: {
      cv?: Express.Multer.File[];
      transcript?: Express.Multer.File[];
      requestLetter?: Express.Multer.File[];
    },
  ) {
    // 3. Validasi bahwa semua file yang dibutuhkan telah diunggah
    if (!files.cv || !files.transcript || !files.requestLetter) {
      throw new BadRequestException(
        'Semua file (CV, Transkrip, Surat Permohonan) wajib diunggah.',
      );
    }

    // 4. Cek apakah user sudah pernah mendaftar sebelumnya
    const existingApplication =
      await this.prisma.internshipApplication.findUnique({
        where: { userId: userId },
      });

    if (existingApplication) {
      throw new ConflictException(
        'Anda sudah pernah mengajukan pendaftaran magang.',
      );
    }

    // 5. Ambil path dari setiap file
    const cvPath = files.cv[0].path;
    const transcriptPath = files.transcript[0].path;
    const requestLetterPath = files.requestLetter[0].path;

    // 6. Simpan data ke database
    return this.prisma.internshipApplication.create({
      data: {
        userId: userId,
        cvPath: cvPath,
        transcriptPath: transcriptPath,
        requestLetterPath: requestLetterPath,
        // Status akan otomatis 'pending' karena kita sudah set default di schema.prisma
      },
    });
  }

  findAll() {
    return `This action returns all internshipApplications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} internshipApplication`;
  }

  update(
    id: number,
    updateInternshipApplicationDto: UpdateInternshipApplicationDto,
  ) {
    return `This action updates a #${id} internshipApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} internshipApplication`;
  }
}
