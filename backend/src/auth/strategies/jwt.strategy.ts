/**
 * Modul strategi JWT untuk autentikasi pada aplikasi menggunakan Passport dan NestJS.
 * Mengambil token JWT dari header Authorization dan memverifikasi menggunakan secret dari environment.
 *
 * @module JwtStrategy
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Kelas strategi JWT untuk autentikasi.
 * Bertugas mengambil dan memverifikasi token JWT dari request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Membuat instance JwtStrategy.
   * @param configService Service untuk mengambil konfigurasi environment.
   * @throws Error jika JWT_SECRET tidak ditemukan di environment.
   */
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET tidak ditemukan di environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Memvalidasi payload JWT dan mengembalikan informasi user.
   * @param payload Payload hasil decode JWT.
   * @returns Object berisi userId, email, dan role.
   */
  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    role: string;
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
