/**
 * Modul DTO untuk pembuatan user baru.
 * Berisi definisi enum peran yang dapat dibuat dan kelas DTO untuk validasi input user.
 *
 * @module CreateUserDto
 */

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Enum CreatableRoles
 * Mendefinisikan peran yang dapat dibuat oleh sistem.
 *
 * @enum {string}
 */
export enum CreatableRoles {
  STAFF_BPS = 'Staff BPS',
  ADMIN = 'Admin',
}

/**
 * Kelas CreateUserDto
 * DTO (Data Transfer Object) untuk validasi data input saat pembuatan user baru.
 *
 * @class
 * @property {string} name - Nama lengkap user, wajib diisi.
 * @property {string} email - Alamat email user, wajib format email yang valid.
 * @property {string} password - Password user, minimal 8 karakter.
 * @property {CreatableRoles} roleName - Peran user, hanya dapat diisi dengan nilai dari enum CreatableRoles.
 */
export class CreateUserDto {
  /**
   * Nama lengkap user.
   * Tidak boleh kosong.
   */
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
  name: string;

  /**
   * Alamat email user.
   * Harus menggunakan format email yang valid.
   */
  @IsEmail({}, { message: 'Format email tidak valid.' })
  email: string;

  /**
   * Password user.
   * Minimal terdiri dari 8 karakter.
   */
  @IsString()
  @MinLength(8, { message: 'Password minimal harus 8 karakter.' })
  password: string;

  /**
   * Peran user yang akan dibuat.
   * Hanya dapat diisi dengan nilai dari enum CreatableRoles.
   */
  @IsEnum(CreatableRoles, {
    message: 'Peran harus salah satu dari: Staff BPS, Admin',
  })
  roleName: CreatableRoles;
}
