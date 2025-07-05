// src/auth/dto/login-user.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;
}
