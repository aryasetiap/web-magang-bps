// src/auth/google.strategy.ts (Versi yang sudah diperbaiki)

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientID || !clientSecret) {
      throw new Error(
        'GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET tidak ditemukan di file .env',
      );
    }

    super({
      clientID, // <-- Sekarang ini dijamin string
      clientSecret, // <-- Sekarang ini dijamin string
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      // 1. Tambahkan baris ini untuk mengatasi error
      passReqToCallback: true,
    });
  }

  // 2. Tambahkan 'request: any' sebagai parameter pertama
  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    // Ambil user dari database jika sudah ada, atau buat baru jika belum
    // (atau lakukan di AuthService.googleLogin)
    const user = {
      userId: profile.id, // atau mapping ke ID user di DB jika sudah ada
      email: emails[0].value,
      role: 'Mahasiswa', // atau ambil dari DB jika sudah ada
    };
    done(null, user);
  }
}
