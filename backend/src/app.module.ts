/**
 * Modul utama aplikasi yang mengatur seluruh dependensi dan konfigurasi global.
 *
 * @module AppModule
 */

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
 * AppModule
 *
 * Modul utama yang mengimpor seluruh modul fitur, konfigurasi, serta modul-modul pendukung lain yang dibutuhkan aplikasi.
 *
 * @class
 */
@Module({
  imports: [
    /**
     * Menginisialisasi modul konfigurasi agar dapat digunakan secara global di seluruh aplikasi.
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * Modul database Prisma untuk akses data.
     */
    PrismaModule,

    /**
     * Modul autentikasi pengguna.
     */
    AuthModule,

    /**
     * Modul manajemen pengguna.
     */
    UsersModule,

    /**
     * Modul aplikasi magang.
     */
    InternshipApplicationsModule,

    /**
     * Modul absensi peserta magang.
     */
    AttendancesModule,

    /**
     * Modul logbook peserta magang.
     */
    LogbooksModule,

    /**
     * Modul tugas peserta magang.
     */
    TasksModule,

    /**
     * Modul pengumpulan tugas.
     */
    SubmissionsModule,

    /**
     * Modul proyek akhir peserta magang.
     */
    FinalProjectsModule,

    /**
     * Modul sertifikat peserta magang.
     */
    CertificatesModule,

    /**
     * Mengatur Multer untuk penyimpanan file upload pada direktori './uploads'.
     */
    MulterModule.register({
      dest: './uploads',
    }),

    /**
     * Mengaktifkan modul penjadwalan tugas (cron jobs).
     */
    ScheduleModule.forRoot(),
  ],
  controllers: [
    /**
     * Controller utama aplikasi.
     */
    AppController,
  ],
  providers: [
    /**
     * Service utama aplikasi.
     */
    AppService,
  ],
})
export class AppModule {}
