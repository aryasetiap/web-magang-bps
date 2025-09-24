/**
 * @module RegisterDto
 * Modul ini mendefinisikan Data Transfer Object (DTO) untuk proses registrasi user baru.
 * DTO ini berisi validasi dan dokumentasi Swagger untuk setiap field yang diperlukan saat registrasi.
 */

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RegisterDto
 *
 * DTO untuk menerima data registrasi user baru.
 *
 * @property {string} name - Nama lengkap user.
 * @property {string} email - Alamat email user.
 * @property {string} password - Password user (minimal 6 karakter).
 */
export class RegisterDto {
  /**
   * Nama lengkap user.
   * @example "John Doe"
   */
  @ApiProperty({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  @IsString({ message: 'Nama harus berupa teks' })
  name: string;

  /**
   * Email user.
   * @example "john@example.com"
   */
  @ApiProperty({
    description: 'Email user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  /**
   * Password user (minimal 6 karakter).
   * @example "password123"
   */
  @ApiProperty({
    description: 'Password user (minimal 6 karakter)',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
