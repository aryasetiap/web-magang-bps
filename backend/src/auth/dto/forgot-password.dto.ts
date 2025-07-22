import { IsEmail } from 'class-validator';

/**
 * Data Transfer Object for handling forgot password requests.
 * Requires a valid email address.
 */
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
