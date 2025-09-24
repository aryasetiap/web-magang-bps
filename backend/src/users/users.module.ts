import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * @module UsersModule
 * @description
 * Modul ini bertanggung jawab untuk mengelola fitur terkait pengguna,
 * termasuk service dan controller yang berhubungan dengan user.
 *
 * Impor:
 * - PrismaModule: Untuk akses database menggunakan Prisma.
 *
 * Ekspor:
 * - UsersService: Service yang dapat digunakan oleh modul lain.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
  /**
   * @class UsersModule
   * @description
   * Kelas modul untuk mengelola dependensi dan konfigurasi fitur user.
   *
   * Tidak menerima parameter dan tidak mengembalikan nilai.
   */
}
