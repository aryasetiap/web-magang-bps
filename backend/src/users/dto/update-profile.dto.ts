// src/users/dto/update-profile.dto.ts

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nama user',
    required: false,
  })
  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Nama lengkap user',
    required: false,
  })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsOptional()
  namaLengkap?: string;

  @ApiProperty({
    description: 'NIM/NISN user',
    required: false,
  })
  @IsString({ message: 'NIM/NISN harus berupa teks' })
  @IsOptional()
  nimNisn?: string;

  @ApiProperty({
    description: 'Asal institusi user',
    required: false,
  })
  @IsString({ message: 'Asal institusi harus berupa teks' })
  @IsOptional()
  asalInstitusi?: string;

  @ApiProperty({
    description: 'Jurusan/Program Studi user',
    required: false,
  })
  @IsString({ message: 'Jurusan/Prodi harus berupa teks' })
  @IsOptional()
  jurusanProdi?: string;

  @ApiProperty({
    description: 'Nomor telepon user',
    required: false,
  })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @IsOptional()
  nomorTelepon?: string;

  @ApiProperty({
    description: 'Alamat user',
    required: false,
  })
  @IsString({ message: 'Alamat harus berupa teks' })
  @IsOptional()
  alamat?: string;

  // Field baru tidak perlu validasi karena akan dihandle oleh multer
}
