import { Module } from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { InternshipApplicationsController } from './internship-applications.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

/**
 * Modul utama untuk mengelola aplikasi magang, termasuk konfigurasi upload file.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /**
         * Menentukan folder tujuan penyimpanan file upload berdasarkan fieldname.
         * Folder akan dibuat secara otomatis jika belum ada.
         * @param req - Objek request dari Express
         * @param file - Objek file yang diupload
         * @param callback - Fungsi callback untuk menentukan folder tujuan
         */
        destination: (req, file, callback) => {
          const folder = join('uploads', file.fieldname);
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
          }
          callback(null, folder);
        },
        /**
         * Membuat nama file unik untuk setiap file yang diupload.
         * Nama file terdiri dari 32 karakter acak dan ekstensi asli file.
         * @param req - Objek request dari Express
         * @param file - Objek file yang diupload
         * @param callback - Fungsi callback untuk menentukan nama file
         */
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileExtension = extname(file.originalname);
          callback(null, `${randomName}${fileExtension}`);
        },
      }),
    }),
  ],
  controllers: [InternshipApplicationsController],
  providers: [InternshipApplicationsService],
})
export class InternshipApplicationsModule {
  /**
   * Kelas modul untuk aplikasi magang.
   * Mengatur dependency controller dan service terkait aplikasi magang.
   */
}
