import { IsString, MinLength } from 'class-validator';

/**
 * DTO untuk mengganti password pengguna.
 *
 * - oldPassword: Password lama pengguna.
 * - newPassword: Password baru pengguna, minimal 6 karakter.
 */
export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
