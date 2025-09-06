/**
 * Modul DTO untuk pembuatan sertifikat baru.
 * Berisi definisi struktur data dan validasi input.
 */

import { IsString, IsInt } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk membuat sertifikat baru.
 *
 * @property {string} certificateNumber - Nomor unik sertifikat.
 * @property {number} userId - ID pengguna yang menerima sertifikat.
 * @property {string} predicate - Predikat yang diberikan pada sertifikat.
 * @property {string} namaKepalaBPS - Nama kepala BPS yang menandatangani sertifikat.
 * @property {string} nipKepalaBPS - NIP kepala BPS yang menandatangani sertifikat.
 */
export class CreateCertificateDto {
  /**
   * Nomor unik sertifikat.
   */
  @IsString()
  certificateNumber: string;

  /**
   * ID pengguna yang menerima sertifikat.
   */
  @IsInt()
  userId: number;

  /**
   * Predikat yang diberikan pada sertifikat.
   */
  @IsString()
  predicate: string;

  /**
   * Nama kepala BPS yang menandatangani sertifikat.
   */
  @IsString()
  namaKepalaBPS: string;

  /**
   * NIP kepala BPS yang menandatangani sertifikat.
   */
  @IsString()
  nipKepalaBPS: string;
}
