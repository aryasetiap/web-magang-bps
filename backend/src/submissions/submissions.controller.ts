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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * Controller untuk menangani endpoint terkait submission.
 * Seluruh endpoint pada controller ini membutuhkan autentikasi JWT.
 */
@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) { }

  /**
   * Endpoint untuk melakukan resubmit submission.
   * Pengguna dapat mengunggah file baru dan memberikan deskripsi tambahan.
   *
   * @param id - ID submission yang akan di-resubmit
   * @param file - File baru yang diunggah oleh pengguna
   * @param description - Deskripsi tambahan dari pengguna
   * @param req - Objek request yang berisi data user (sudah terautentikasi)
   * @returns Hasil dari proses resubmit submission
   */
  @Patch(':id/resubmit')
  @UseInterceptors(FileInterceptor('file'))
  async resubmit(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.submissionsService.resubmit(id, userId, file, description);
  }
}
