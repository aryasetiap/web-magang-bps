/**
 * @module main
 * @description
 * Modul utama untuk melakukan bootstrap aplikasi NestJS.
 * Mengatur validasi global, CORS, dan penyajian aset statis.
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

/**
 * Melakukan inisialisasi dan konfigurasi aplikasi NestJS.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Tidak mengembalikan nilai, hanya menjalankan server.
 *
 * @description
 * Fungsi ini akan:
 * - Menginisialisasi aplikasi dengan AppModule.
 * - Mengatur global validation pipe untuk validasi DTO.
 * - Mengaktifkan CORS untuk frontend.
 * - Menyajikan folder 'uploads' sebagai aset statis.
 * - Menjalankan server pada port 3000.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  setupGlobalPipes(app);
  setupCors(app);
  setupStaticAssets(app);

  await app.listen(3000);
}

/**
 * Mengatur global validation pipe pada aplikasi.
 *
 * @param {NestExpressApplication} app - Instance aplikasi NestJS.
 * @returns {void}
 */
function setupGlobalPipes(app: NestExpressApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}

/**
 * Mengaktifkan CORS pada aplikasi.
 *
 * @param {NestExpressApplication} app - Instance aplikasi NestJS.
 * @returns {void}
 */
function setupCors(app: NestExpressApplication): void {
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
}

/**
 * Menyajikan folder 'uploads' sebagai aset statis.
 *
 * @param {NestExpressApplication} app - Instance aplikasi NestJS.
 * @returns {void}
 */
function setupStaticAssets(app: NestExpressApplication): void {
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });
}

void bootstrap();
