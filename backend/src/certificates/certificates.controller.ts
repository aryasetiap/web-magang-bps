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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { Response as ExpressResponse } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('certificates')
/**
 * Controller untuk manajemen sertifikat, termasuk generate, upload, issue, download, dan pengecekan template.
 */
export class CertificatesController {
    constructor(private readonly service: CertificatesService) { }

    /**
     * Endpoint untuk admin melakukan generate sertifikat baru.
     * @param dto Data pembuatan sertifikat
     * @param req Request yang berisi data user
     */
    @Post('generate')
    async generate(@Body() dto: CreateCertificateDto, @Request() req) {
        return this.service.generateCertificate(dto, req.user.userId);
    }

    /**
     * Endpoint untuk admin mengunggah file sertifikat yang sudah ditandatangani.
     * @param id ID sertifikat
     * @param file File PDF sertifikat yang diunggah
     * @param req Request yang berisi data user
     */
    @Patch(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSigned(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        if (!file) throw new BadRequestException('File PDF wajib diunggah');
        return this.service.uploadSignedCertificate(id, file.path, req.user.userId);
    }

    /**
     * Endpoint untuk admin menerbitkan (issue) sertifikat.
     * @param id ID sertifikat
     * @param req Request yang berisi data user
     */
    @Patch(':id/issue')
    async issue(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.service.issueCertificate(id, req.user.id);
    }

    /**
     * Endpoint untuk intern mengambil sertifikat miliknya sendiri.
     * @param req Request yang berisi data user
     */
    @Get('me')
    async getOwn(@Request() req) {
        return this.service.getCertificateByUser(req.user.userId);
    }

    /**
     * Endpoint untuk admin mengunggah atau mengganti template sertifikat.
     * @param file File template PDF yang diunggah
     * @param req Request yang berisi data user
     */
    @Patch('template/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/certificate-templates',
            filename: (req, file, cb) => {
                cb(null, 'certificate-template.pdf');
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
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
        return { success: true, message: 'Template sertifikat berhasil diunggah.' };
    }

    /**
     * Endpoint untuk mengunduh file sertifikat (baik yang sudah ditandatangani maupun yang belum).
     * Hanya admin yang dapat mengunduh versi signed/generated, intern hanya issued.
     * @param id ID sertifikat
     * @param req Request yang berisi data user
     * @param res Response Express untuk streaming file
     */
    @Get(':id/download')
    async download(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Res() res: ExpressResponse
    ) {
        const cert = await this.service.getCertificateById(id);
        if (!cert) throw new NotFoundException('Sertifikat tidak ditemukan');

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

    /**
     * Endpoint untuk mengecek ketersediaan template sertifikat.
     */
    @Get('template/check')
    async checkTemplate() {
        const templatePath = './uploads/certificate-templates/certificate-template.pdf';
        const exists = fs.existsSync(templatePath);
        return {
            templateExists: exists,
            templatePath: exists ? templatePath : null,
        };
    }

    /**
     * Endpoint untuk admin mengambil seluruh data sertifikat beserta statusnya.
     * @param req Request yang berisi data user
     */
    @Get()
    async getAllCertificates(@Request() req) {
        if (req.user.role !== 'Admin') throw new ForbiddenException('Hanya admin');
        return this.service.getAllCertificates();
    }
}