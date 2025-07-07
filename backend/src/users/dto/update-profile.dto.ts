// src/users/dto/update-profile.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsOptional()
  namaLengkap?: string;

  @IsString({ message: 'NIM/NISN harus berupa teks' })
  @IsOptional()
  nimNisn?: string;

  @IsString({ message: 'Asal institusi harus berupa teks' })
  @IsOptional()
  asalInstitusi?: string;

  @IsString({ message: 'Jurusan/Prodi harus berupa teks' })
  @IsOptional()
  jurusanProdi?: string;

  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @IsOptional()
  nomorTelepon?: string;

  @IsString({ message: 'Alamat harus berupa teks' })
  @IsOptional()
  alamat?: string;
}
