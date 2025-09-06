/**
 * Modul DTO untuk proses login user.
 * Berisi definisi struktur data yang digunakan saat user melakukan login.
 *
 * @module LoginDto
 */

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) untuk login user.
 *
 * Tujuan:
 *   - Mendefinisikan struktur data yang dibutuhkan saat user melakukan login.
 *   - Melakukan validasi pada email dan password yang diterima.
 *
 * Properti:
 *   - email: string - Email user yang harus berformat valid.
 *   - password: string - Password user dalam bentuk teks.
 */
export class LoginDto {
  /**
   * Email user yang digunakan untuk login.
   *
   * @type {string}
   * @example 'john@example.com'
   */
  @ApiProperty({
    description: 'Email user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  /**
   * Password user yang digunakan untuk login.
   *
   * @type {string}
   * @example 'password123'
   */
  @ApiProperty({
    description: 'Password user',
    example: 'password123',
  })
  @IsString({ message: 'Password harus berupa teks' })
  password: string;
}
