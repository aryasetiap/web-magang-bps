// src/auth/google.strategy.ts (Versi Final yang Benar)

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
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/auth/google/callback', // Ini URL yang benar
      scope: ['email', 'profile'],
    });
  }

  // Method validate ini TIDAK perlu passReqToCallback, kita sederhanakan
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    // Kita hanya mem-packing data yang dibutuhkan oleh AuthService
    const userPayload = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    // 'done' akan menempelkan 'userPayload' ini ke req.user
    done(null, userPayload);
  }
}
