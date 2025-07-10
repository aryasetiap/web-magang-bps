import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  // ...method lain...

  async resubmit(
    submissionId: number,
    userId: number,
    file: Express.Multer.File,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission tidak ditemukan.');
    if (submission.userId !== userId)
      throw new ForbiddenException(
        'Anda tidak berhak mengubah submission ini.',
      );

    // Hapus file lama jika ada
    if (submission.filePath && fs.existsSync(submission.filePath)) {
      fs.unlinkSync(submission.filePath);
    }

    // Update submission dengan file baru dan status submitted (atau revisi jika ingin)
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        filePath: file.path,
        status: 'submitted', // atau 'revisi' jika ingin status revisi dulu
        grade: null,
        feedback: null,
      },
    });
  }
}
