import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InternshipApplicationsModule } from './internship-applications/internship-applications.module';
import { AttendancesModule } from './attendances/attendances.module';
import { LogbooksModule } from './logbooks/logbooks.module';
import { TasksModule } from './tasks/tasks.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { FinalProjectsModule } from './final-projects/final-projects.module';
import { CertificatesModule } from './certificates/certificates.module';

/**
 * AppModule adalah modul utama aplikasi yang mengatur seluruh dependensi dan konfigurasi global.
 * Modul ini mengimpor seluruh modul fitur, konfigurasi, serta modul-modul pendukung lain yang dibutuhkan aplikasi.
 */
@Module({
  imports: [
    // Menginisialisasi modul konfigurasi agar dapat digunakan secara global di seluruh aplikasi
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
    CertificatesModule,
    // Mengatur Multer untuk penyimpanan file upload pada direktori './uploads'
    MulterModule.register({
      dest: './uploads',
    }),
    // Mengaktifkan modul penjadwalan tugas (cron jobs)
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
