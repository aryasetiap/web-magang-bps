import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

import { InternshipApplicationsService } from './internship-applications.service';
import { InternshipApplicationsController } from './internship-applications.controller';

/**
 * Menghasilkan nama file unik dengan 32 karakter acak dan ekstensi asli file.
 * @param file - Objek file yang diupload
 * @returns Nama file unik dengan ekstensi asli
 */
function generateUniqueFilename(file: Express.Multer.File): string {
  const randomName = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  const fileExtension = extname(file.originalname);
  return `${randomName}${fileExtension}`;
}

/**
 * Menentukan folder tujuan penyimpanan file upload berdasarkan fieldname.
 * Membuat folder secara rekursif jika belum ada.
 * @param file - Objek file yang diupload
 * @returns Path folder tujuan penyimpanan file
 */
function resolveUploadDestination(file: Express.Multer.File): string {
  const folder = join('uploads', file.fieldname);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
}

/**
 * Modul utama untuk mengelola aplikasi magang, termasuk konfigurasi upload file.
 * Mengatur dependency controller dan service terkait aplikasi magang.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /**
         * Callback untuk menentukan folder tujuan penyimpanan file upload.
         * @param req - Objek request dari Express
         * @param file - Objek file yang diupload
         * @param callback - Fungsi callback untuk menentukan folder tujuan
         */
        destination: (req, file, callback) => {
          callback(null, resolveUploadDestination(file));
        },
        /**
         * Callback untuk menentukan nama file yang diupload.
         * @param req - Objek request dari Express
         * @param file - Objek file yang diupload
         * @param callback - Fungsi callback untuk menentukan nama file
         */
        filename: (req, file, callback) => {
          callback(null, generateUniqueFilename(file));
        },
      }),
    }),
  ],
  controllers: [InternshipApplicationsController],
  providers: [InternshipApplicationsService],
})
export class InternshipApplicationsModule {}
