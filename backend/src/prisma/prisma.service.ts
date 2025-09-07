/**
 * @module PrismaService
 * Modul ini menyediakan service untuk mengelola koneksi Prisma dengan database
 * pada aplikasi berbasis NestJS. Service ini memastikan koneksi database
 * terinisialisasi dan ditutup dengan benar sesuai siklus hidup modul.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Kelas PrismaService bertanggung jawab untuk mengelola koneksi Prisma dengan database.
 * Kelas ini menginisialisasi koneksi saat modul diinisialisasi dan menutup koneksi saat modul dihancurkan.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Fungsi lifecycle yang dipanggil secara otomatis saat modul diinisialisasi.
   * Fungsi ini memastikan koneksi ke database berhasil dibuat.
   *
   * @returns {Promise<void>} Tidak mengembalikan nilai, hanya memastikan koneksi database aktif.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Fungsi lifecycle yang dipanggil secara otomatis saat modul dihancurkan.
   * Fungsi ini digunakan untuk menutup koneksi Prisma ke database.
   *
   * @returns {Promise<void>} Tidak mengembalikan nilai, hanya memastikan koneksi database ditutup.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
