import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object untuk registrasi user baru.
 * Berisi validasi dan dokumentasi Swagger untuk setiap field.
 */
export class RegisterDto {
  /**
   * Nama lengkap user.
   * Contoh: "John Doe"
   */
  @ApiProperty({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  @IsString({ message: 'Nama harus berupa teks' })
  name: string;

  /**
   * Email user.
   * Contoh: "john@example.com"
   */
  @ApiProperty({
    description: 'Email user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  /**
   * Password user (minimal 6 karakter).
   * Contoh: "password123"
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
