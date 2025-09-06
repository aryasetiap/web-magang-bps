/**
 * Modul Controller untuk mengelola endpoint aplikasi magang.
 * Berisi endpoint untuk pembuatan, pengambilan, dan pembaruan status aplikasi magang.
 * Seluruh endpoint dilindungi oleh mekanisme autentikasi dan otorisasi berbasis peran.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Query,
} from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { CreateInternshipApplicationDto } from './dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from './dto/update-internship-application.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * Controller untuk mengelola pengajuan magang.
 * Menyediakan endpoint CRUD dan pembaruan status aplikasi magang.
 */
@Controller('internship-applications')
export class InternshipApplicationsController {
  /**
   * Konstruktor controller.
   * @param internshipApplicationsService Service untuk pengelolaan aplikasi magang
   */
  constructor(
    private readonly internshipApplicationsService: InternshipApplicationsService,
  ) {}

  /**
   * Membuat pengajuan magang baru.
   * Hanya dapat diakses oleh user yang sudah login.
   * Mendukung upload file CV, transkrip, dan surat permohonan.
   *
   * @param files File yang diupload (cv, transcript, requestLetter)
   * @param req Request object yang berisi data user
   * @param createInternshipApplicationDto Data pengajuan magang
   * @returns Data pengajuan magang yang berhasil dibuat
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'transcript', maxCount: 1 },
      { name: 'requestLetter', maxCount: 1 },
    ]),
  )
  create(
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      transcript?: Express.Multer.File[];
      requestLetter?: Express.Multer.File[];
    },
    @Request() req: { user: { userId: number } },
    @Body() createInternshipApplicationDto: CreateInternshipApplicationDto,
  ) {
    const userId = req.user.userId;
    return this.internshipApplicationsService.create(
      userId,
      createInternshipApplicationDto,
      files,
    );
  }

  /**
   * Mengambil seluruh data pengajuan magang.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   * Mendukung fitur paginasi.
   *
   * @param paginationQuery Parameter paginasi
   * @returns Daftar seluruh pengajuan magang
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Staff BPS')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.internshipApplicationsService.findAll(paginationQuery);
  }

  /**
   * Mengambil data pengajuan magang milik user yang sedang login.
   * Hanya dapat diakses oleh user dengan peran Intern.
   *
   * @param req Request object yang berisi data user
   * @returns Data pengajuan magang milik user
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Intern')
  async getMyApplication(@Request() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    return {
      data: await this.internshipApplicationsService.findByUser(userId),
    };
  }

  /**
   * Mengambil detail pengajuan magang berdasarkan ID.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   *
   * @param id ID pengajuan magang
   * @returns Detail pengajuan magang
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Staff BPS')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(Number(id));
  }

  /**
   * Memperbarui status pengajuan magang.
   * Hanya dapat diakses oleh Admin dan Staff BPS.
   *
   * @param id ID pengajuan magang
   * @param updateApplicationStatusDto Data status baru
   * @param req Request object yang berisi data admin
   * @returns Data pengajuan magang yang telah diperbarui statusnya
   */
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'Staff BPS')
  updateStatus(
    @Param('id') id: string,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @Request() req: { user: { userId: number } },
  ) {
    const adminId = req.user.userId;
    return this.internshipApplicationsService.updateStatus(
      Number(id),
      adminId,
      updateApplicationStatusDto,
    );
  }

  /**
   * Memperbarui data aplikasi magang (partial update).
   * Hanya dapat diakses oleh user Intern.
   *
   * @param id ID aplikasi magang
   * @param updateInternshipApplicationDto Data yang akan diupdate
   * @param req Request object yang berisi data user
   * @returns Data aplikasi magang yang telah diupdate
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Intern')
  update(
    @Param('id') id: string,
    @Body() updateInternshipApplicationDto: UpdateInternshipApplicationDto,
    @Request() req: { user: { userId: number } },
  ) {
    const userId = req.user.userId;
    return this.internshipApplicationsService.update(
      Number(id),
      userId,
      updateInternshipApplicationDto,
    );
  }
}
