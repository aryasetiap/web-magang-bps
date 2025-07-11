import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService], // jika ingin digunakan di module lain
})
export class SubmissionsModule {}
