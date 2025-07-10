import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  // 1. Tambahkan impor dan konfigurasi MulterModule di sini
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Simpan file di folder yang sama
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
