/**
 * Modul DTO untuk memperbarui profil user.
 *
 * Berisi definisi kelas dan properti yang digunakan untuk validasi serta dokumentasi
 * data yang dapat diperbarui oleh user pada profil mereka.
 *
 * @module UpdateProfileDto
 */

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) untuk memperbarui profil user.
 *
 * Digunakan untuk validasi dan dokumentasi data yang dapat diperbarui oleh user.
 * Setiap properti bersifat opsional dan divalidasi sesuai tipe datanya.
 */
export class UpdateProfileDto {
  /**
   * Nama user.
   * @type {string}
   */
  @ApiProperty({ description: 'Nama user', required: false })
  @IsString({ message: 'Nama harus berupa teks' })
  @IsOptional()
  name?: string;

  /**
   * Nama lengkap user.
   * @type {string}
   */
  @ApiProperty({ description: 'Nama lengkap user', required: false })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsOptional()
  namaLengkap?: string;

  /**
   * NIM/NISN user.
   * @type {string}
   */
  @ApiProperty({ description: 'NIM/NISN user', required: false })
  @IsString({ message: 'NIM/NISN harus berupa teks' })
  @IsOptional()
  nimNisn?: string;

  /**
   * Asal institusi user.
   * @type {string}
   */
  @ApiProperty({ description: 'Asal institusi user', required: false })
  @IsString({ message: 'Asal institusi harus berupa teks' })
  @IsOptional()
  asalInstitusi?: string;

  /**
   * Jurusan atau program studi user.
   * @type {string}
   */
  @ApiProperty({ description: 'Jurusan/Program Studi user', required: false })
  @IsString({ message: 'Jurusan/Prodi harus berupa teks' })
  @IsOptional()
  jurusanProdi?: string;

  /**
   * Nomor telepon user.
   * @type {string}
   */
  @ApiProperty({ description: 'Nomor telepon user', required: false })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @IsOptional()
  nomorTelepon?: string;

  /**
   * Alamat user.
   * @type {string}
   */
  @ApiProperty({ description: 'Alamat user', required: false })
  @IsString({ message: 'Alamat harus berupa teks' })
  @IsOptional()
  alamat?: string;

  /**
   * Status pendidikan user.
   * @type {string}
   */
  @ApiProperty({ description: 'Status pendidikan', required: false })
  @IsString({ message: 'Status pendidikan harus berupa teks' })
  @IsOptional()
  educationStatus?: string;

  /**
   * Jenis kegiatan yang diikuti user.
   * @type {string}
   */
  @ApiProperty({ description: 'Jenis kegiatan', required: false })
  @IsString({ message: 'Jenis kegiatan harus berupa teks' })
  @IsOptional()
  activityType?: string;

  /**
   * Tanggal mulai kegiatan.
   * @type {Date}
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
   * @type {Date}
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
