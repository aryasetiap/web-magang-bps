// import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// export class RegisterUserDto {
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   @MinLength(8, { message: 'Password must be at least 8 characters long' })
//   password: string;
// }

// src/auth/dto/register-user.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal harus 8 karakter' })
  password: string;
}
