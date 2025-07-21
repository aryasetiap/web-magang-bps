import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService bertanggung jawab untuk mengelola koneksi Prisma dengan database.
 * Service ini menginisialisasi koneksi saat modul diinisialisasi dan menutup koneksi saat modul dihancurkan.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Fungsi ini dipanggil secara otomatis saat modul diinisialisasi.
   * Digunakan untuk memastikan koneksi ke database berhasil dibuat.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Fungsi ini dipanggil secara otomatis saat modul dihancurkan.
   * Digunakan untuk menutup koneksi Prisma ke database.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
