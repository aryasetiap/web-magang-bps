import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

/**
 * Fungsi utama untuk melakukan bootstrap aplikasi NestJS.
 * - Mengatur global validation pipe.
 * - Mengaktifkan CORS untuk frontend.
 * - Menyajikan folder 'uploads' sebagai aset statis.
 * - Menjalankan server pada port 3000.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Agar @Transform pada DTO berjalan
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}

bootstrap();
