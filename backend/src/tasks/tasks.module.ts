import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Modul Tasks
 * 
 * Modul ini bertanggung jawab untuk mengelola fitur terkait tugas (tasks),
 * termasuk konfigurasi upload lampiran menggunakan Multer.
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        /**
         * Menentukan folder tujuan penyimpanan file upload.
         * Semua lampiran tugas akan disimpan di folder './uploads/tasks'.
         */
        destination: './uploads/tasks',
        /**
         * Membuat nama file unik untuk setiap file yang di-upload.
         * Nama file dihasilkan secara acak dan mempertahankan ekstensi aslinya.
         * 
         * @param req - Objek request dari Express
         * @param file - Objek file yang di-upload
         * @param callback - Fungsi callback untuk mengembalikan nama file
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
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
