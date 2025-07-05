// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Menentukan cara token diekstrak dari request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Memastikan token tidak dihiraukan jika sudah kadaluwarsa
      ignoreExpiration: false,
      // Kunci rahasia untuk memverifikasi tanda tangan token
      secretOrKey: 'INI_RAHASIA_SEKALI_JANGAN_DITIRU', // HARUS SAMA DENGAN DI auth.module.ts
    });
  }

  // Method ini akan berjalan SETELAH token berhasil diverifikasi
  async validate(payload: any) {
    // payload adalah hasil dekripsi dari token JWT
    // Apa pun yang di-return dari sini akan ditempelkan oleh Passport ke object Request sebagai `req.user`
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
