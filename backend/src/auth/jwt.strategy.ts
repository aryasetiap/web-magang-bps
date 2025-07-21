// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Menentukan cara token diekstrak dari request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Memastikan token tidak dihiraukan jika sudah kadaluwarsa
      ignoreExpiration: false,
      // Kunci rahasia untuk memverifikasi tanda tangan token
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  // Method ini akan berjalan SETELAH token berhasil diverifikasi
  async validate(payload: any) {
    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
