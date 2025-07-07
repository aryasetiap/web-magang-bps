// src/internship-applications/internship-applications.module.ts

import { Module } from '@nestjs/common';
import { InternshipApplicationsService } from './internship-applications.service';
import { InternshipApplicationsController } from './internship-applications.controller';
import { MulterModule } from '@nestjs/platform-express'; // 1. Impor MulterModule

@Module({
  // 2. Daftarkan MulterModule di sini
  imports: [
    MulterModule.register({
      dest: './uploads', // Tentukan folder tujuan untuk menyimpan file
    }),
  ],
  controllers: [InternshipApplicationsController],
  providers: [InternshipApplicationsService],
})
export class InternshipApplicationsModule {}
