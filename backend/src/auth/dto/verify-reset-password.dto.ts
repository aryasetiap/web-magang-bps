/**
 * Modul DTO untuk verifikasi dan reset password pengguna.
 *
 * Berisi definisi kelas data transfer object (DTO) yang digunakan
 * untuk memvalidasi data pada proses verifikasi OTP dan reset password.
 */

import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Kelas DTO untuk verifikasi OTP dan reset password.
 *
 * Digunakan untuk memvalidasi data yang dikirimkan saat pengguna
 * melakukan permintaan reset password menggunakan OTP.
 *
 * @property email - Email pengguna yang akan direset passwordnya.
 * @property otp - Kode OTP yang dikirim ke email pengguna.
 * @property newPassword - Password baru yang akan digunakan (minimal 6 karakter).
 */
export class VerifyResetPasswordDto {
  /**
   * Email pengguna yang akan direset passwordnya.
   */
  @IsEmail()
  email: string;

  /**
   * Kode OTP yang dikirim ke email pengguna.
   */
  @IsString()
  otp: string;

  /**
   * Password baru yang akan digunakan (minimal 6 karakter).
   */
  @IsString()
  @MinLength(6)
  newPassword: string;
}
