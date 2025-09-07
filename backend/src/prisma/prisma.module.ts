import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Modul global untuk menyediakan PrismaService ke seluruh aplikasi.
 *
 * Modul ini bertanggung jawab untuk menginisialisasi dan mengekspor PrismaService,
 * sehingga dapat digunakan oleh modul-modul lain tanpa perlu impor berulang.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
