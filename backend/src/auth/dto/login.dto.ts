import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object untuk login user.
 * Berisi email dan password yang divalidasi.
 */
export class LoginDto {
  @ApiProperty({
    description: 'Email user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    description: 'Password user',
    example: 'password123',
  })
  @IsString({ message: 'Password harus berupa teks' })
  password: string;
}
