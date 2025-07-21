import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}