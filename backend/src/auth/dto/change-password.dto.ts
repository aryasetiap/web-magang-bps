/**
 * Modul DTO untuk proses penggantian password pengguna.
 *
 * Berisi struktur data yang digunakan saat pengguna ingin mengganti password,
 * termasuk validasi untuk memastikan data yang diterima sesuai ketentuan.
 */

import { IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk mengganti password pengguna.
 *
 * Properti:
 * - oldPassword: Password lama pengguna (string).
 * - newPassword: Password baru pengguna (string, minimal 6 karakter).
 */
export class ChangePasswordDto {
  /**
   * Password lama pengguna.
   */
  @IsString()
  oldPassword: string;

  /**
   * Password baru pengguna, minimal 6 karakter.
   */
  @IsString()
  @MinLength(6)
  newPassword: string;
}
