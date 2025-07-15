import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class InternshipApplicationsService {
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
    this.validateFiles(files);

    // Validasi periode magang jika ada
    if (
      createInternshipApplicationDto.startDate &&
      createInternshipApplicationDto.endDate
    ) {
      this.validateInternshipPeriod(
        createInternshipApplicationDto.startDate,
        createInternshipApplicationDto.endDate,
        false, // false = tidak untuk admin
      );
    }

    const existingApplication =
      await this.prisma.internshipApplication.findUnique({
        where: { userId: userId },
      });

    if (existingApplication) {
      Object.values(files).forEach((fileArray) => {
        if (fileArray && fileArray[0]) fs.unlinkSync(fileArray[0].path);
      });
      throw new ConflictException(
        'Anda sudah pernah mengajukan pendaftaran magang.',
      );
    }

    const cvPath = files.cv![0].path;
    const transcriptPath = files.transcript![0].path;
    const requestLetterPath = files.requestLetter![0].path;

    return this.prisma.internshipApplication.create({
      data: {
        userId: userId,
        cvPath: cvPath,
        transcriptPath: transcriptPath,
        requestLetterPath: requestLetterPath,
        startDate: createInternshipApplicationDto.startDate
          ? new Date(createInternshipApplicationDto.startDate)
          : null,
        endDate: createInternshipApplicationDto.endDate
          ? new Date(createInternshipApplicationDto.endDate)
          : null,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.internshipApplication.findMany({
        include: {
          applicant: {
            select: {
              name: true,
              email: true,
              namaLengkap: true,
              asalInstitusi: true,
              nimNisn: true, // Tambahkan ini
              jurusanProdi: true, // Tambahkan ini
            },
          },
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.internshipApplication.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: applications,
      meta: {
        totalItems: total,
        itemCount: applications.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: totalPages,
      },
    };
  }

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

    const baseUrl = 'http://localhost:3000';
    const cvUrl = `${baseUrl}/${application.cvPath.replace(/\\/g, '/')}`;
    const transcriptUrl = `${baseUrl}/${application.transcriptPath.replace(
      /\\/g,
      '/',
    )}`;
    const requestLetterUrl = `${baseUrl}/${application.requestLetterPath.replace(/\\/g, '/')}`;

    return {
      ...application,
      cvUrl,
      transcriptUrl,
      requestLetterUrl,
    };
  }

  async updateStatus(
    id: number,
    adminId: number,
    updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    // Validasi periode magang jika admin set periode
    if (
      updateApplicationStatusDto.startDate &&
      updateApplicationStatusDto.endDate
    ) {
      this.validateInternshipPeriod(
        updateApplicationStatusDto.startDate,
        updateApplicationStatusDto.endDate,
        true, // true = untuk admin
      );
    }

    const updateData: any = {
      status: updateApplicationStatusDto.status,
      feedback: updateApplicationStatusDto.feedback,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    };

    // Tambah periode magang jika ada
    if (updateApplicationStatusDto.startDate) {
      updateData.startDate = new Date(updateApplicationStatusDto.startDate);
    }
    if (updateApplicationStatusDto.endDate) {
      updateData.endDate = new Date(updateApplicationStatusDto.endDate);
    }

    return this.prisma.internshipApplication.update({
      where: { id: id },
      data: updateData,
    });
  }

  async findByUser(userId: number) {
    return this.prisma.internshipApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private validateFiles(files: {
    cv?: Express.Multer.File[];
    transcript?: Express.Multer.File[];
    requestLetter?: Express.Multer.File[];
  }) {
    const requiredFields = ['cv', 'transcript', 'requestLetter'];
    for (const field of requiredFields) {
      if (!files[field] || !files[field][0]) {
        throw new BadRequestException(`File untuk '${field}' wajib diunggah.`);
      }
    }

    const allFiles = [
      ...files.cv!,
      ...files.transcript!,
      ...files.requestLetter!,
    ];
    const maxSize = 2 * 1024 * 1024;

    for (const file of allFiles) {
      if (!file.mimetype.includes('pdf')) {
        Object.values(files).forEach((fileArray) => {
          if (fileArray && fileArray[0]) fs.unlinkSync(fileArray[0].path);
        });
        throw new BadRequestException(
          `Tipe file tidak valid: ${file.originalname}. Hanya file PDF yang diizinkan.`,
        );
      }
      if (file.size > maxSize) {
        Object.values(files).forEach((fileArray) => {
          if (fileArray && fileArray[0]) fs.unlinkSync(fileArray[0].path);
        });
        throw new BadRequestException(
          `Ukuran file terlalu besar: ${file.originalname}. Ukuran maksimum adalah 2 MB.`,
        );
      }
    }
  }

  // Method baru untuk validasi periode magang
  private validateInternshipPeriod(
    startDate: string,
    endDate: string,
    isAdmin: boolean,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validasi startDate < endDate
    if (start >= end) {
      throw new BadRequestException(
        'Tanggal mulai magang harus sebelum tanggal selesai magang.',
      );
    }

    // Validasi minimal 1 bulan
    const oneMonthLater = new Date(start);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    if (end < oneMonthLater) {
      throw new BadRequestException('Durasi magang minimal 1 bulan.');
    }

    // Validasi maksimal 6 bulan
    const sixMonthsLater = new Date(start);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    if (end > sixMonthsLater) {
      throw new BadRequestException('Durasi magang maksimal 6 bulan.');
    }

    // Validasi startDate tidak di masa lalu (kecuali admin)
    if (!isAdmin && start < now) {
      throw new BadRequestException(
        'Tanggal mulai magang tidak boleh di masa lalu.',
      );
    }
  }
}
