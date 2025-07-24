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
/**
 * Service untuk mengelola aplikasi pendaftaran magang.
 */
export class InternshipApplicationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Menghapus file yang telah diunggah jika terjadi error atau validasi gagal.
   * @param files - Objek berisi file yang diunggah (cv, transcript, requestLetter)
   */
  private deleteUploadedFiles(files: {
    cv?: Express.Multer.File[];
    transcript?: Express.Multer.File[];
    requestLetter?: Express.Multer.File[];
  }) {
    Object.values(files).forEach((fileArray) => {
      if (fileArray && fileArray[0]) fs.unlinkSync(fileArray[0].path);
    });
  }

  /**
   * Membuat aplikasi pendaftaran magang baru.
   * @param userId - ID pengguna yang mendaftar
   * @param createInternshipApplicationDto - Data pendaftaran magang
   * @param files - File yang diunggah (cv, transcript, requestLetter)
   * @returns Data aplikasi magang yang berhasil dibuat
   */
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

    if (
      createInternshipApplicationDto.startDate &&
      createInternshipApplicationDto.endDate
    ) {
      this.validateInternshipPeriod(
        createInternshipApplicationDto.startDate,
        createInternshipApplicationDto.endDate,
        false,
      );
    }

    const existingApplication =
      await this.prisma.internshipApplication.findUnique({
        where: { userId: userId },
      });

    // Hanya blokir jika status masih 'pending' atau 'diterima'
    if (existingApplication && existingApplication.status !== 'ditolak') {
      this.deleteUploadedFiles(files);
      throw new ConflictException(
        'Anda sudah pernah mengajukan pendaftaran magang.',
      );
    }

    const cvPath = files.cv && files.cv[0] ? files.cv[0].path : null;
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

  /**
   * Mengambil daftar seluruh aplikasi magang dengan fitur paginasi.
   * @param paginationQuery - Parameter paginasi (page, limit)
   * @returns Daftar aplikasi magang beserta metadata paginasi
   */
  async findAll(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.internshipApplication.findMany({
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              namaLengkap: true,
              nimNisn: true,
              asalInstitusi: true,
              jurusanProdi: true,
              nomorTelepon: true,
              alamat: true,
              educationStatus: true,
              activityType: true,
              activityStart: true,
              activityEnd: true,
              isGraduated: true,
              role: {
                select: { name: true },
              },
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

  /**
   * Mengambil detail aplikasi magang berdasarkan ID.
   * @param id - ID aplikasi magang
   * @returns Detail aplikasi magang beserta URL file yang diunggah
   */
  async findOne(id: number) {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: id },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            namaLengkap: true,
            nimNisn: true,
            asalInstitusi: true,
            jurusanProdi: true,
            nomorTelepon: true,
            alamat: true,
            educationStatus: true,
            activityType: true,
            activityStart: true,
            activityEnd: true,
            role: {
              select: {
                name: true,
              },
            },
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
    const cvUrl = application.cvPath
      ? `${baseUrl}/${application.cvPath.replace(/\\/g, '/')}`
      : null;
    const transcriptUrl = `${baseUrl}/${application.transcriptPath.replace(/\\/g, '/')}`;
    const requestLetterUrl = `${baseUrl}/${application.requestLetterPath.replace(/\\/g, '/')}`;

    return {
      ...application,
      cvUrl,
      transcriptUrl,
      requestLetterUrl,
    };
  }

  /**
   * Memperbarui status aplikasi magang oleh admin.
   * @param id - ID aplikasi magang
   * @param adminId - ID admin yang memverifikasi
   * @param updateApplicationStatusDto - Data status dan feedback baru
   * @returns Data aplikasi magang yang telah diperbarui
   */
  async updateStatus(
    id: number,
    adminId: number,
    updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    if (
      updateApplicationStatusDto.startDate &&
      updateApplicationStatusDto.endDate
    ) {
      this.validateInternshipPeriod(
        updateApplicationStatusDto.startDate,
        updateApplicationStatusDto.endDate,
        true,
      );
    }

    const updateData: any = {
      status: updateApplicationStatusDto.status,
      feedback: updateApplicationStatusDto.feedback,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    };

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

  /**
   * Mengambil seluruh aplikasi magang berdasarkan userId.
   * @param userId - ID pengguna
   * @returns Daftar aplikasi magang milik pengguna
   */
  async findByUser(userId: number) {
    return this.prisma.internshipApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Validasi file yang diunggah, memastikan file wajib ada dan sesuai ketentuan.
   * @param files - Objek file yang diunggah
   * @throws BadRequestException jika file tidak sesuai
   */
  private validateFiles(files: {
    cv?: Express.Multer.File[];
    transcript?: Express.Multer.File[];
    requestLetter?: Express.Multer.File[];
  }) {
    const requiredFields = ['transcript', 'requestLetter'];
    for (const field of requiredFields) {
      if (!files[field] || !files[field][0]) {
        throw new BadRequestException(`File untuk '${field}' wajib diunggah.`);
      }
    }

    const allFiles = [
      ...(files.cv ?? []),
      ...files.transcript!,
      ...files.requestLetter!,
    ];
    const maxSize = 2 * 1024 * 1024;

    for (const file of allFiles) {
      if (!file.mimetype.includes('pdf')) {
        this.deleteUploadedFiles(files);
        throw new BadRequestException(
          `Tipe file tidak valid: ${file.originalname}. Hanya file PDF yang diizinkan.`,
        );
      }
      if (file.size > maxSize) {
        this.deleteUploadedFiles(files);
        throw new BadRequestException(
          `Ukuran file terlalu besar: ${file.originalname}. Ukuran maksimum adalah 2 MB.`,
        );
      }
    }
  }

  /**
   * Validasi periode magang (mulai, selesai, minimal, maksimal, dan masa lalu).
   * @param startDate - Tanggal mulai magang (string)
   * @param endDate - Tanggal selesai magang (string)
   * @param isAdmin - True jika validasi dilakukan oleh admin
   * @throws BadRequestException jika periode tidak valid
   */
  private validateInternshipPeriod(
    startDate: string,
    endDate: string,
    isAdmin: boolean,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      throw new BadRequestException(
        'Tanggal mulai magang harus sebelum tanggal selesai magang.',
      );
    }

    const oneMonthLater = new Date(start);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    if (end < oneMonthLater) {
      throw new BadRequestException('Durasi magang minimal 1 bulan.');
    }

    const sixMonthsLater = new Date(start);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    if (end > sixMonthsLater) {
      throw new BadRequestException('Durasi magang maksimal 6 bulan.');
    }

    if (!isAdmin && start < now) {
      throw new BadRequestException(
        'Tanggal mulai magang tidak boleh di masa lalu.',
      );
    }
  }
}
