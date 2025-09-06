/**
 * Modul strategi autentikasi Google OAuth 2.0 untuk aplikasi NestJS.
 * Mengambil kredensial dari environment variable dan memvalidasi profil pengguna Google.
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Profile as GoogleProfile } from 'passport-google-oauth20';

/**
 * Kelas GoogleStrategy mengatur autentikasi menggunakan Google OAuth 2.0.
 * Mendapatkan konfigurasi dari environment variable dan membangun objek pengguna dari profil Google.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  /**
   * Konstruktor GoogleStrategy.
   * @param configService - Service untuk mengambil konfigurasi aplikasi.
   * @throws Error jika kredensial Google OAuth tidak ditemukan di environment variable.
   */
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      configService.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:3000/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error(
        'Kredensial Google OAuth belum dikonfigurasi dengan benar pada environment variable.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Fungsi validasi profil pengguna Google.
   * @param accessToken - Token akses OAuth.
   * @param refreshToken - Token refresh OAuth.
   * @param profile - Profil pengguna Google.
   * @param done - Callback untuk meneruskan objek pengguna.
   * @returns void
   */
  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName ?? '';
    const lastName = profile.name?.familyName ?? '';
    const picture = profile.photos?.[0]?.value;

    const user = {
      email,
      firstName,
      lastName,
      picture,
      accessToken,
    };

    done(null, user);
  }
}
