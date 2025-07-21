import { Global, Module } from '@nestjs/common'; // 1. Import 'Global'
import { PrismaService } from './prisma.service';

@Global() // 2. Tambahkan decorator @Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 3. Pastikan PrismaService di-export
})
export class PrismaModule {}

