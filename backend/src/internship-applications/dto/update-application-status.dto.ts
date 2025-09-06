/**
 * Modul DTO untuk memperbarui status aplikasi magang.
 * Berisi definisi kelas dan validasi properti yang diperlukan saat memperbarui status aplikasi magang.
 */

import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { StatusInternship } from '@prisma/client';

/**
 * Data Transfer Object (DTO) untuk memperbarui status aplikasi magang.
 *
 * Properti:
 * - status: Status aplikasi magang (wajib, enum StatusInternship).
 * - feedback: Umpan balik aplikasi magang (opsional, string).
 * - startDate: Tanggal mulai magang (opsional, string tanggal ISO).
 * - endDate: Tanggal selesai magang (opsional, string tanggal ISO, divalidasi jika startDate diisi).
 */
export class UpdateApplicationStatusDto {
  /**
   * Status aplikasi magang.
   * Hanya dapat bernilai salah satu dari enum StatusInternship.
   */
  @IsEnum(StatusInternship, {
    message: 'Status harus salah satu dari: pending, diterima, ditolak',
  })
  status: StatusInternship;

  /**
   * Umpan balik terkait aplikasi magang.
   * Opsional dan harus berupa string jika diisi.
   */
  @IsOptional()
  @IsString({ message: 'Feedback harus berupa teks.' })
  feedback?: string;

  /**
   * Tanggal mulai magang.
   * Opsional dan harus berupa string tanggal ISO yang valid jika diisi.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  /**
   * Tanggal selesai magang.
   * Opsional, hanya divalidasi jika startDate diisi, dan harus berupa string tanggal ISO yang valid.
   */
  @ValidateIf((o: UpdateApplicationStatusDto) => o.startDate !== undefined)
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  endDate?: string;
}
