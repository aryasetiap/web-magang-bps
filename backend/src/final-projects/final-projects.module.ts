import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FinalProjectsController } from './final-projects.controller';
import { FinalProjectsService } from './final-projects.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/final-projects',
        filename: (req, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileExtension = extname(file.originalname);
          callback(null, `final-project-${randomName}${fileExtension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow PDF and DOC files
        if (
          file.mimetype === 'application/pdf' ||
          file.mimetype === 'application/msword' ||
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          callback(null, true);
        } else {
          callback(new Error('Only PDF and DOC files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FinalProjectsController],
  providers: [FinalProjectsService],
  exports: [FinalProjectsService],
})
export class FinalProjectsModule {}
