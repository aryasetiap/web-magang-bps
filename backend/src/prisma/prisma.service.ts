import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Perintah ini memastikan koneksi ke database berhasil dibuat saat modul diinisialisasi.
    await this.$connect();
  }
}
