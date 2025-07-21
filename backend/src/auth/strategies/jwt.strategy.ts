import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Strategi JWT untuk autentikasi menggunakan Passport.
 * Mengambil token JWT dari header Authorization dan memverifikasi menggunakan secret dari environment.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Konstruktor JwtStrategy.
   * @param configService Service untuk mengambil konfigurasi environment.
   * @throws Error jika JWT_SECRET tidak ditemukan di environment.
   */
  constructor(private configService: ConfigService) {
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
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
