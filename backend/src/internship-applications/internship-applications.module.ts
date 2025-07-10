import { Module } from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { InternshipApplicationsController } from './internship-applications.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer'; // 1. Impor diskStorage
import { extname } from 'path'; // 2. Impor extname dari path

@Module({
  imports: [
    // 3. Ganti konfigurasi Multer yang lama dengan yang ini
    MulterModule.register({
      storage: diskStorage({
        // Tentukan folder tujuan
        destination: './uploads',
        // Tentukan bagaimana nama file akan dibuat
        filename: (req, file, callback) => {
          // Buat nama acak untuk mencegah nama file yang sama
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          // Ambil ekstensi file asli (misalnya, '.pdf')
          const fileExtension = extname(file.originalname);
          // Gabungkan nama acak dengan ekstensi asli
          callback(null, `${randomName}${fileExtension}`);
        },
      }),
    }),
  ],
  controllers: [InternshipApplicationsController],
  providers: [InternshipApplicationsService],
})
export class InternshipApplicationsModule {}
