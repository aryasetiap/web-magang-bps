import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Tanda @Global() inilah yang membuatnya tersedia di seluruh aplikasi
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Ekspor service agar bisa di-inject di modul lain
})
export class PrismaModule {}
