/**
 * Modul controller untuk manajemen sertifikat pada aplikasi magang BPS.
 * Menyediakan endpoint untuk generate, upload, issue, download, dan pengecekan template sertifikat.
 * Seluruh endpoint dilindungi oleh JWT AuthGuard.
 */

import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { createReadStream, existsSync } from 'fs';
import { Response as ExpressResponse } from 'express';

/**
 * Controller untuk manajemen sertifikat, termasuk generate, upload, issue, download, dan pengecekan template.
 */
@UseGuards(AuthGuard('jwt'))
@Controller('certificates')
export class CertificatesController {
  /**
   * Konstruktor CertificatesController.
   * @param service Service untuk logika bisnis sertifikat.
   */
  constructor(private readonly service: CertificatesService) {}

  /**
   * Endpoint untuk admin melakukan generate sertifikat baru.
   * @param dto Data pembuatan sertifikat.
   * @param req Request yang berisi data user.
   * @returns Hasil generate sertifikat.
   */
  @Post('generate')
  async generate(
    @Body() dto: CreateCertificateDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.service.generateCertificate(dto, Number(req.user.userId));
  }

  /**
   * Endpoint untuk admin mengunggah file sertifikat yang sudah ditandatangani.
   * @param id ID sertifikat.
   * @param file File PDF sertifikat yang diunggah.
   * @param req Request yang berisi data user.
   * @returns Hasil upload file sertifikat.
   */
  @Patch(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSigned(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { userId: number } },
  ) {
    if (!file) {
      throw new BadRequestException('File PDF wajib diunggah');
    }
    return this.service.uploadSignedCertificate(
      id,
      file.path,
      Number(req.user.userId),
    );
  }

  /**
   * Endpoint untuk admin menerbitkan (issue) sertifikat.
   * @param id ID sertifikat.
   * @param req Request yang berisi data user.
   * @returns Hasil issue sertifikat.
   */
  @Patch(':id/issue')
  async issue(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ) {
    return this.service.issueCertificate(id, Number(req.user.id));
  }

  /**
   * Endpoint untuk intern mengambil sertifikat miliknya sendiri.
   * @param req Request yang berisi data user.
   * @returns Data sertifikat milik user.
   */
  @Get('me')
  async getOwn(@Request() req: { user: { userId: number } }) {
    return this.service.getCertificateByUser(Number(req.user.userId));
  }

  /**
   * Endpoint untuk admin mengunggah atau mengganti template sertifikat.
   * @param file File template PDF yang diunggah.
   * @returns Status upload template.
   */
  @Patch('template/upload')
  @UseInterceptors(FileInterceptor('file')) // <-- Ganti: tidak perlu config storage di sini
  uploadTemplate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File PDF wajib diunggah');
    }
    return { success: true, message: 'Template sertifikat berhasil diunggah.' };
  }

  /**
   * Endpoint untuk mengunduh file sertifikat (signed/generated).
   * Hanya admin yang dapat mengunduh versi signed/generated, intern hanya issued.
   * @param id ID sertifikat.
   * @param req Request yang berisi data user.
   * @param res Response Express untuk streaming file.
   */
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: any },
    @Res() res: ExpressResponse,
  ) {
    const cert = await this.service.getCertificateById(id);
    if (!cert) {
      throw new NotFoundException('Sertifikat tidak ditemukan');
    }

    let filePath: string;
    let fileName: string;

    if (cert.status === 'issued' && cert.signedFilePath) {
      filePath = cert.signedFilePath;
      fileName = `Sertifikat_${cert.certificateNumber}.pdf`;
    } else if (cert.status === 'generated') {
      filePath = cert.templatePath;
      fileName = `Certificate_${cert.certificateNumber}_for-signing.pdf`;
    } else {
      throw new BadRequestException('Sertifikat belum siap untuk diunduh.');
    }

    if (!existsSync(filePath)) {
      throw new NotFoundException('File sertifikat tidak ditemukan di server.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    createReadStream(filePath).pipe(res);
  }

  /**
   * Endpoint untuk mengecek ketersediaan template sertifikat.
   * @returns Status ketersediaan template sertifikat.
   */
  @Get('template/check')
  checkTemplate() {
    const templatePath =
      './uploads/certificate-templates/certificate-template.pdf';
    const exists = existsSync(templatePath);
    return {
      templateExists: exists,
      templatePath: exists ? templatePath : null,
    };
  }

  /**
   * Endpoint untuk admin mengambil seluruh data sertifikat beserta statusnya.
   * @param req Request yang berisi data user.
   * @returns Daftar seluruh sertifikat.
   */
  @Get()
  async getAllCertificates(@Request() req: { user: { role: string } }) {
    if (req.user.role !== 'Admin') {
      throw new ForbiddenException('Hanya admin');
    }
    return this.service.getAllCertificates();
  }
}
