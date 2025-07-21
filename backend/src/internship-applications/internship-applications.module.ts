import { Module } from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { InternshipApplicationsController } from './internship-applications.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Modul untuk mengelola aplikasi magang, termasuk konfigurasi upload file.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /**
         * Menentukan folder tujuan penyimpanan file upload.
         * @param req - Request yang masuk
         * @param file - File yang diupload
         * @param callback - Callback untuk menentukan folder tujuan
         */
        destination: './uploads',
        /**
         * Membuat nama file unik untuk setiap file yang diupload.
         * Nama file dihasilkan secara acak dan mempertahankan ekstensi asli.
         * @param req - Request yang masuk
         * @param file - File yang diupload
         * @param callback - Callback untuk menentukan nama file
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
export class InternshipApplicationsModule {}
