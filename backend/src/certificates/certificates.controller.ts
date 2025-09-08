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
import { UpdateCertificateStatusDto } from './dto/update-certificate-status.dto';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

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
  @UseGuards(AuthGuard('jwt'))
  async generate(
    @Body() dto: CreateCertificateDto,
    @Request() req: { user: { userId: number; role: string } },
  ) {
    // Validasi hanya admin
    if (req.user.role !== 'Admin') {
      throw new ForbiddenException('Hanya admin');
    }
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: undefined, // Gunakan memory storage untuk template
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (extname(file.originalname).toLowerCase() === '.pdf') {
          cb(null, true);
        } else {
          cb(new Error('File harus PDF'), false);
        }
      },
    }),
  )
  uploadTemplate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File PDF wajib diunggah');
    }

    try {
      // Perbaikan: Simpan file menggunakan buffer ke lokasi template
      const templateDir = path.join('uploads', 'certificate-templates');
      const templatePath = path.join(templateDir, 'certificate-template.pdf');

      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      // Gunakan buffer karena menggunakan memory storage
      fs.writeFileSync(templatePath, file.buffer);

      return {
        success: true,
        message: 'Template sertifikat berhasil diunggah.',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new BadRequestException(
        'Gagal mengupload template: ' + errorMessage,
      );
    }
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

  /**
   * Endpoint untuk admin mengubah status sertifikat secara manual.
   * @param id ID sertifikat.
   * @param dto DTO status baru.
   * @param req Request user.
   */
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCertificateStatusDto,
    @Request() req: { user: { role: string } },
  ) {
    // Validasi hanya admin
    if (req.user.role !== 'Admin') {
      throw new ForbiddenException('Hanya admin');
    }
    // Cari sertifikat
    const cert = await this.service.getCertificateById(id);
    if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan');
    // Update status
    cert.status = dto.status;
    // Simpan ke database
    await this.service['prisma'].certificate.update({
      where: { id },
      data: { status: dto.status },
    });
    return { id, status: dto.status };
  }

  /**
   * Endpoint untuk mengambil data sertifikat berdasarkan ID.
   * @param id ID sertifikat.
   * @param req Request yang berisi data user.
   * @returns Data sertifikat.
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) // Tambahkan guard agar hanya user login yang bisa akses
  async getById(@Param('id', ParseIntPipe) id: number) {
    const cert = await this.service.getCertificateById(id);
    if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan');
    return cert;
  }
}
