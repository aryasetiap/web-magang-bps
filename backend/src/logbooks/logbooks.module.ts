import { Module } from '@nestjs/common';
import { LogbooksService } from './logbooks.service';
import { LogbooksController } from './logbooks.controller';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Modul Logbooks
 * 
 * Modul ini bertanggung jawab untuk mengelola fitur logbook,
 * termasuk controller dan service yang berkaitan dengan logbook.
 */
@Module({
  controllers: [LogbooksController],
  providers: [LogbooksService, PrismaService],
})
export class LogbooksModule {}
