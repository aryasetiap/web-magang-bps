import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO untuk memperbarui profil user.
 * 
 * Digunakan untuk validasi dan dokumentasi data yang dapat diperbarui oleh user.
 */
export class UpdateProfileDto {
  /**
   * Nama user.
   */
  @ApiProperty({
    description: 'Nama user',
    required: false,
  })
  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;

  /**
   * Nama lengkap user.
   */
  @ApiProperty({
    description: 'Nama lengkap user',
    required: false,
  })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsOptional()
  namaLengkap?: string;

  /**
   * NIM/NISN user.
   */
  @ApiProperty({
    description: 'NIM/NISN user',
    required: false,
  })
  @IsString({ message: 'NIM/NISN harus berupa teks' })
  @IsOptional()
  nimNisn?: string;

  /**
   * Asal institusi user.
   */
  @ApiProperty({
    description: 'Asal institusi user',
    required: false,
  })
  @IsString({ message: 'Asal institusi harus berupa teks' })
  @IsOptional()
  asalInstitusi?: string;

  /**
   * Jurusan atau program studi user.
   */
  @ApiProperty({
    description: 'Jurusan/Program Studi user',
    required: false,
  })
  @IsString({ message: 'Jurusan/Prodi harus berupa teks' })
  @IsOptional()
  jurusanProdi?: string;

  /**
   * Nomor telepon user.
   */
  @ApiProperty({
    description: 'Nomor telepon user',
    required: false,
  })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @IsOptional()
  nomorTelepon?: string;

  /**
   * Alamat user.
   */
  @ApiProperty({
    description: 'Alamat user',
    required: false,
  })
  @IsString({ message: 'Alamat harus berupa teks' })
  @IsOptional()
  alamat?: string;

  /**
   * Status pendidikan user.
   */
  @ApiProperty({
    description: 'Status pendidikan',
    required: false,
  })
  @IsString({ message: 'Status pendidikan harus berupa teks' })
  @IsOptional()
  educationStatus?: string;

  /**
   * Jenis kegiatan yang diikuti user.
   */
  @ApiProperty({
    description: 'Jenis kegiatan',
    required: false,
  })
  @IsString({ message: 'Jenis kegiatan harus berupa teks' })
  @IsOptional()
  activityType?: string;

  /**
   * Tanggal mulai kegiatan.
   */
  @ApiProperty({
    description: 'Tanggal mulai kegiatan',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  activityStart?: Date;

  /**
   * Tanggal selesai kegiatan.
   */
  @ApiProperty({
    description: 'Tanggal selesai kegiatan',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  activityEnd?: Date;
}
