import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nama lengkap user',
    example: 'John Doe',
  })
  @IsString({ message: 'Nama harus berupa teks' })
  name: string;

  @ApiProperty({
    description: 'Email user',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    description: 'Password user (minimal 6 karakter)',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
