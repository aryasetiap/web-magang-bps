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
    Response,
    ParseIntPipe,
    NotFoundException,
    BadRequestException,
    Res, // Tambahkan ini
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateStatusDto } from './dto/update-certificate-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import { Response as ExpressResponse } from 'express'; // Tambahkan ini

@UseGuards(AuthGuard('jwt'))
@Controller('certificates')
export class CertificatesController {
    constructor(private readonly service: CertificatesService) { }

    // Admin: Generate certificate
    @Post('generate')
    async generate(@Body() dto: CreateCertificateDto, @Request() req) {
        // Gunakan req.user.userId agar pasti number
        return this.service.generateCertificate(dto, req.user.userId);
    }

    // Admin: Upload signed certificate
    @Patch(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSigned(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        if (!file) throw new Error('File PDF wajib diunggah');
        return this.service.uploadSignedCertificate(id, file.path, req.user.id);
    }

    // Admin: Issue certificate
    @Patch(':id/issue')
    async issue(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.issueCertificate(id, req.user.id);
    }

    // Intern: Get own certificate
    @Get('me')
    async getOwn(@Request() req) {
        // Ganti req.user.id menjadi req.user.userId
        return this.service.getCertificateByUser(req.user.userId);
    }

    // Admin: Upload/replace certificate template
    @Patch('template/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/certificate-templates',
            filename: (req, file, cb) => {
                cb(null, 'certificate-template.pdf');
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
            if (extname(file.originalname).toLowerCase() === '.pdf') cb(null, true);
            else cb(new Error('File harus PDF'), false);
        },
    }))
    async uploadTemplate(
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        if (!file) throw new BadRequestException('File PDF wajib diunggah');
        // Anda bisa menambah log audit di sini jika perlu
        return { success: true, message: 'Template sertifikat berhasil diunggah.' };
    }

    // Intern/Admin: Download certificate (generated/signed)
    @Get(':id/download')
    async download(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Res() res: ExpressResponse // Gunakan tipe ini
    ) {
        const cert = await this.service.getCertificateById(id);
        if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan');

        // Hanya admin bisa download versi signed/generate, intern hanya issued
        // (opsional: cek role di req.user.role)

        // Pilih file yang akan dikirim
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

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('File sertifikat tidak ditemukan di server.');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const stream = createReadStream(filePath);
        stream.pipe(res);
    }

    @Get('template/check')
    async checkTemplate() {
        const templatePath = './uploads/certificate-templates/certificate-template.pdf';
        const exists = fs.existsSync(templatePath);
        return {
            templateExists: exists,
            templatePath: exists ? templatePath : null,
        };
    }
}
// console.log('adminId:', req.user.id);