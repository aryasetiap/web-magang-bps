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
import { TasksModule } from './tasks/tasks.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { FinalProjectsModule } from './final-projects/final-projects.module';
import { CertificatesModule } from './certificates/certificates.module';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';

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
    TasksModule,
    SubmissionsModule,
    FinalProjectsModule,
    CertificatesModule, // Tambahkan ini
    MulterModule.register({
      dest: './uploads',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
