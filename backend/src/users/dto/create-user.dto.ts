import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Enum untuk mendefinisikan peran yang dapat dibuat oleh sistem.
 */
export enum CreatableRoles {
  STAFF_BPS = 'Staff BPS',
  ADMIN = 'Admin',
}

/**
 * DTO untuk membuat user baru.
 * Digunakan untuk validasi data input saat pembuatan user.
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
