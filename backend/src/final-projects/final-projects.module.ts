import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FinalProjectsController } from './final-projects.controller';
import { FinalProjectsService } from './final-projects.service';

/**
 * Menghasilkan nama file unik untuk file upload final project.
 * @param req - Objek request dari Express.
 * @param file - Objek file yang diupload.
 * @param callback - Fungsi callback untuk mengembalikan nama file.
 */
function generateUniqueFilename(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
): void {
  const randomHex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  const fileExtension = extname(file.originalname);
  callback(null, `final-project-${randomHex}${fileExtension}`);
}

/**
 * Melakukan filter terhadap tipe file yang diizinkan untuk diupload.
 * Hanya file PDF dan DOC/DOCX yang diperbolehkan.
 * @param req - Objek request dari Express.
 * @param file - Objek file yang diupload.
 * @param callback - Fungsi callback untuk menentukan apakah file diterima.
 */
function fileTypeFilter(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Hanya file PDF atau DOC yang diperbolehkan!'), false);
  }
}

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
         */
        destination: './uploads/final-projects',
        filename: generateUniqueFilename,
      }),
      /**
       * Filter file yang diizinkan untuk diupload.
       */
      fileFilter: fileTypeFilter,
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
export class FinalProjectsModule {}
