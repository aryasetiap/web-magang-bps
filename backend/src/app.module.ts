import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config'; // 1. Impor ConfigModule
import { InternshipApplicationsModule } from './internship-applications/internship-applications.module';
import { AttendancesModule } from './attendances/attendances.module';
import { LogbooksModule } from './logbooks/logbooks.module';

@Module({
  imports: [
    // 2. Daftarkan ConfigModule di paling atas, dan buat jadi global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InternshipApplicationsModule,
    AttendancesModule,
    LogbooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
