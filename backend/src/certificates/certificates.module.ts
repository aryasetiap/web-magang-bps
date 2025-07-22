import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Modul CertificatesModule
 * 
 * Modul ini bertanggung jawab untuk mengelola fitur terkait sertifikat,
 * termasuk upload file PDF sertifikat yang sudah ditandatangani.
 */
@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                /**
                 * Menentukan direktori tujuan penyimpanan file sertifikat yang diupload.
                 * File akan disimpan di './uploads/certificates/signed'.
                 */
                destination: './uploads/certificates/signed',
                /**
                 * Membuat nama file unik untuk setiap file yang diupload.
                 * Format nama: certificate-signed-{timestamp}-{random}.{ext}
                 */
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `certificate-signed-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal ukuran file: 5MB
            /**
             * Filter file yang diizinkan untuk diupload.
             * Hanya file dengan ekstensi .pdf yang diperbolehkan.
             */
            fileFilter: (req, file, cb) => {
                if (extname(file.originalname).toLowerCase() === '.pdf') {
                    cb(null, true);
                } else {
                    cb(new Error('File harus PDF'), false);
                }
            },
        }),
    ],
    controllers: [CertificatesController],
    providers: [CertificatesService],
    exports: [CertificatesService],
})
export class CertificatesModule { }
