import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO untuk verifikasi dan reset password.
 *
 * @property email - Email pengguna yang akan direset passwordnya.
 * @property otp - Kode OTP yang dikirim ke email pengguna.
 * @property newPassword - Password baru yang akan digunakan (minimal 6 karakter).
 */
export class VerifyResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
