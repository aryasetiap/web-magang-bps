import { Module } from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { LogbooksController } from './logbooks.controller';
import { PrismaService } from '../prisma/prisma.service';

/**
 * @module LogbooksModule
 * @description
 * Modul ini bertanggung jawab untuk mengelola fitur logbook,
 * termasuk controller dan service yang berkaitan dengan logbook.
 */
@Module({
  controllers: [LogbooksController],
  providers: [LogbooksService, PrismaService],
})
export class LogbooksModule {
  /**
   * @class LogbooksModule
   * @description
   * Kelas modul utama untuk fitur logbook.
   * Tidak menerima parameter dan tidak mengembalikan nilai.
   */
  constructor() {
    // Konstruktor default, tidak ada inisialisasi khusus.
  }
}
