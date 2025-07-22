import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Modul Submissions
 * 
 * Modul ini bertanggung jawab untuk mengelola fitur terkait submissions,
 * termasuk controller dan service yang dibutuhkan.
 */
@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService, PrismaService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
