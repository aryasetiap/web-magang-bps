import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

/**
 * Menghasilkan nama file unik dengan ekstensi asli file.
 *
 * @param req - Objek request dari Express
 * @param file - Objek file yang di-upload
 * @param callback - Fungsi callback untuk mengembalikan nama file
 * @returns void
 */
function generateUniqueFilename(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
): void {
  const randomName = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  const fileExtension = extname(file.originalname);
  callback(null, `${randomName}${fileExtension}`);
}

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
         */
        filename: generateUniqueFilename,
      }),
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {
  /**
   * Kelas modul Tasks.
   *
   * Bertanggung jawab untuk mengelola dependensi dan konfigurasi terkait fitur tugas.
   */
}
