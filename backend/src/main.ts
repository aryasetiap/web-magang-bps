import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. Import ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Terapkan ValidationPipe secara global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Secara otomatis menghapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Melempar error jika ada properti yang tidak seharusnya ada
      transform: true, // Secara otomatis mengubah payload menjadi instance dari DTO class
    }),
  );

  await app.listen(3000);
}
bootstrap();
