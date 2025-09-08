/**
 * Modul controller untuk menangani endpoint terkait submission.
 * Seluruh endpoint pada controller ini membutuhkan autentikasi JWT.
 *
 * @module SubmissionsController
 */

import {
  Controller,
  Patch,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Request,
  ParseIntPipe,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

/**
 * Controller untuk mengelola endpoint submission.
 * Seluruh endpoint membutuhkan autentikasi JWT.
 */
@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
  /**
   * Membuat instance SubmissionsController.
   *
   * @param submissionsService - Service untuk menangani logika submission
   */
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * Endpoint untuk melakukan resubmit submission.
   * Pengguna dapat mengunggah file baru dan memberikan deskripsi tambahan.
   *
   * @param id - ID submission yang akan di-resubmit
   * @param file - File baru yang diunggah oleh pengguna
   * @param description - Deskripsi tambahan dari pengguna
   * @param req - Objek request yang berisi data user (sudah terautentikasi)
   * @returns Promise hasil dari proses resubmit submission
   */
  @Patch(':id/resubmit')
  @UseInterceptors(FileInterceptor('file'))
  async resubmit(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @Request() req: { user: { userId: number } },
  ): Promise<any> {
    const userId = req.user.userId;
    return this.submissionsService.resubmit(id, userId, file, description);
  }

  /**
   * Endpoint untuk submit tugas baru.
   * User dapat mengunggah file dan/atau deskripsi.
   */
  @Patch(':taskId/submit')
  @UseInterceptors(FileInterceptor('file'))
  async submit(
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Request() req: { user: { userId: number } },
  ): Promise<any> {
    const userId = req.user.userId;
    return this.submissionsService.submit(
      taskId,
      userId,
      file,
      createSubmissionDto.description,
    );
  }

  /**
   * Endpoint untuk memberikan penilaian pada submission.
   * Hanya dapat diakses oleh admin/penilai.
   */
  @Patch(':id/grade')
  async grade(
    @Param('id', ParseIntPipe) id: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @Request() req: { user: { userId: number } },
  ): Promise<any> {
    // Implementasi service grading sesuai kebutuhan Anda
    return this.submissionsService.grade(
      id,
      gradeSubmissionDto,
      req.user.userId,
    );
  }

  /**
   * Endpoint untuk mengambil submissions milik user
   */
  @Get()
  async findMySubmissions(
    @Request() req: { user: { userId: number } },
  ): Promise<any> {
    return this.submissionsService.findMySubmissions(req.user.userId);
  }

  /**
   * Endpoint untuk mengambil detail submission berdasarkan ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; role?: string } },
  ): Promise<any> {
    return this.submissionsService.findOne(id, req.user.userId, req.user.role);
  }

  /**
   * Endpoint untuk mengambil submissions untuk task tertentu (admin only)
   */
  @Get('task/:taskId')
  async findSubmissionsForTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Request() req: { user: { userId: number; role?: string } },
  ): Promise<any> {
    return this.submissionsService.findSubmissionsForTask(
      taskId,
      req.user.userId,
      req.user.role,
    );
  }
}
