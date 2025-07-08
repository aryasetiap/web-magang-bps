// src/internship-applications/internship-applications.service.ts

import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException, // Tambahkan import ini
} from '@nestjs/common';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
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

  // Ganti method findAll() yang lama dengan ini
  findAll() {
    // Mengambil semua data pendaftaran
    return this.prisma.internshipApplication.findMany({
      // Sertakan juga data user yang mendaftar agar informatif
      include: {
        applicant: {
          select: {
            name: true,
            email: true,
            namaLengkap: true,
            asalInstitusi: true,
          },
        },
      },
    });
  }

  // Ganti method findOne() dengan versi yang ditingkatkan
  async findOne(id: number) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: id },
      include: {
        applicant: {
          select: {
            name: true,
            email: true,
            namaLengkap: true,
            nimNisn: true,
            asalInstitusi: true,
            jurusanProdi: true,
            nomorTelepon: true,
            alamat: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Pendaftaran dengan ID ${id} tidak ditemukan.`,
      );
    }

    // [PENINGKATAN] Ubah path menjadi URL lengkap
    const baseUrl = 'http://localhost:3000'; // Nanti bisa diambil dari .env

    // Ganti backslash (\) dengan forward slash (/) agar URL valid
    const cvUrl = `${baseUrl}/${application.cvPath.replace(/\\/g, '/')}`;
    const transcriptUrl = `${baseUrl}/${application.transcriptPath.replace(/\\/g, '/')}`;
    const requestLetterUrl = `${baseUrl}/${application.requestLetterPath.replace(/\\/g, '/')}`;

    return {
      ...application,
      cvUrl,
      transcriptUrl,
      requestLetterUrl,
    };
  }

  // Tambahkan method baru ini
  async updateStatus(
    id: number,
    adminId: number,
    updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    // Kita akan update status, dan juga mencatat siapa & kapan verifikasi dilakukan
    return this.prisma.internshipApplication.update({
      where: { id: id },
      data: {
        status: updateApplicationStatusDto.status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });
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
