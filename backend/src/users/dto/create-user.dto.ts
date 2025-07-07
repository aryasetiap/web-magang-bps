import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  namaLengkap?: string;

  @IsString()
  @IsOptional()
  nimNisn?: string;

  @IsString()
  @IsOptional()
  asalInstitusi?: string;

  @IsString()
  @IsOptional()
  jurusanProdi?: string;

  @IsString()
  @IsOptional()
  nomorTelepon?: string;

  @IsString()
  @IsOptional()
  alamat?: string;

  // roleId akan kita tangani secara terpisah, tidak dari sini
}
