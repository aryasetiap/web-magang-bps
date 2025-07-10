import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

// Enum ini untuk validasi, memastikan hanya peran ini yang bisa dibuat
export enum CreatableRoles {
  STAFF_BPS = 'Staff BPS',
  ADMIN = 'Admin',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal harus 8 karakter.' })
  password: string;

  @IsEnum(CreatableRoles, {
    message: 'Peran harus salah satu dari: Staff BPS, Admin',
  })
  roleName: CreatableRoles;
}
