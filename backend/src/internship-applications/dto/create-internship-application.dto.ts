/**
 * Modul DTO untuk membuat aplikasi magang baru.
 *
 * Berisi definisi kelas dan validasi properti yang diperlukan saat membuat aplikasi magang.
 *
 * @module CreateInternshipApplicationDto
 */

import { IsOptional, IsDateString, ValidateIf } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk pembuatan aplikasi magang baru.
 *
 * Properti:
 * - startDate: (opsional) Tanggal mulai magang dalam format ISO string.
 * - endDate: (opsional) Tanggal selesai magang dalam format ISO string, hanya divalidasi jika startDate diisi.
 */
export class CreateInternshipApplicationDto {
  /**
   * Tanggal mulai magang.
   *
   * Opsional. Jika diisi, harus berupa string tanggal ISO yang valid.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  /**
   * Tanggal selesai magang.
   *
   * Opsional. Hanya divalidasi jika startDate diisi.
   * Jika diisi, harus berupa string tanggal ISO yang valid.
   */
  @ValidateIf((o: CreateInternshipApplicationDto) => o.startDate !== undefined)
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  endDate?: string;
}
