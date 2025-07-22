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
 * Berisi endpoint terkait pembuatan, pengambilan, dan pembaruan status aplikasi magang.
 */
@Controller('internship-applications')
export class InternshipApplicationsController {
  constructor(
    private readonly internshipApplicationsService: InternshipApplicationsService,
  ) { }

  /**
   * Endpoint untuk membuat pengajuan magang baru.
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
    @Request() req,
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
   * Endpoint untuk mengambil seluruh data pengajuan magang.
   * Hanya dapat diakses oleh Admin.
   * Mendukung fitur paginasi.
   * 
   * @param paginationQuery Parameter paginasi
   * @returns Daftar seluruh pengajuan magang
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.internshipApplicationsService.findAll(paginationQuery);
  }

  /**
   * Endpoint untuk mengambil data pengajuan magang milik user yang sedang login.
   * Hanya dapat diakses oleh user dengan peran Intern.
   * 
   * @param req Request object yang berisi data user
   * @returns Data pengajuan magang milik user
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Intern')
  async getMyApplication(@Request() req) {
    const userId = req.user.userId;
    return {
      data: await this.internshipApplicationsService.findByUser(userId),
    };
  }

  /**
   * Endpoint untuk mengambil detail pengajuan magang berdasarkan ID.
   * Hanya dapat diakses oleh Admin.
   * 
   * @param id ID pengajuan magang
   * @returns Detail pengajuan magang
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  findOne(@Param('id') id: string) {
    return this.internshipApplicationsService.findOne(+id);
  }

  /**
   * Endpoint untuk memperbarui status pengajuan magang.
   * Hanya dapat diakses oleh Admin.
   * 
   * @param id ID pengajuan magang
   * @param updateApplicationStatusDto Data status baru
   * @param req Request object yang berisi data admin
   * @returns Data pengajuan magang yang telah diperbarui statusnya
   */
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  updateStatus(
    @Param('id') id: string,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    const adminId = req.user.userId;
    return this.internshipApplicationsService.updateStatus(
      +id,
      adminId,
      updateApplicationStatusDto,
    );
  }
}
