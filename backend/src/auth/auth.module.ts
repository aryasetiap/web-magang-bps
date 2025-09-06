import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

/**
 * Modul Auth
 *
 * Modul ini bertanggung jawab untuk mengelola autentikasi pengguna,
 * termasuk login, registrasi, serta integrasi dengan JWT dan Google OAuth.
 *
 * Impor:
 * - PrismaModule: Untuk akses database.
 * - PassportModule: Untuk strategi autentikasi.
 * - ConfigModule: Untuk konfigurasi environment.
 * - UsersModule: Untuk manajemen data pengguna.
 * - JwtModule: Untuk pengelolaan token JWT.
 *
 * Ekspor:
 * - AuthService: Layanan autentikasi yang dapat digunakan modul lain.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      /**
       * Factory untuk konfigurasi JWT.
       *
       * @param configService - Service untuk mengambil konfigurasi environment.
       * @returns Konfigurasi JWT (secret dan opsi penandatanganan).
       */
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {
  /**
   * Kelas AuthModule
   *
   * Mendefinisikan modul autentikasi untuk aplikasi.
   */
}
