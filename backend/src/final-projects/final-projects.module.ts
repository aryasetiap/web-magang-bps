import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FinalProjectsController } from './final-projects.controller';
import { FinalProjectsService } from './final-projects.service';

/**
 * Modul untuk fitur Final Projects.
 * Mengatur konfigurasi upload file menggunakan Multer,
 * serta mengatur controller dan service terkait Final Projects.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /**
         * Menentukan lokasi penyimpanan file upload dan format nama file.
         * Nama file akan diawali dengan 'final-project-' diikuti string acak dan ekstensi asli.
         */
        destination: './uploads/final-projects',
        filename: (req, file, callback) => {
          /**
           * Membuat nama file unik dengan string hex acak sepanjang 32 karakter.
           */
          const randomHex = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileExtension = extname(file.originalname);
          callback(null, `final-project-${randomHex}${fileExtension}`);
        },
      }),
      /**
       * Filter file yang diizinkan untuk diupload.
       * Hanya mengizinkan file dengan tipe PDF dan DOC/DOCX.
       */
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.mimetype === 'application/msword' ||
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          callback(null, true);
        } else {
          callback(new Error('Hanya file PDF atau DOC yang diperbolehkan!'), false);
        }
      },
      /**
       * Membatasi ukuran maksimal file upload sebesar 10MB.
       */
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [FinalProjectsController],
  providers: [FinalProjectsService],
  exports: [FinalProjectsService],
})
export class FinalProjectsModule { }
