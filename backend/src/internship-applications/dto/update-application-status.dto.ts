import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { StatusInternship } from '@prisma/client';

/**
 * DTO untuk memperbarui status aplikasi magang.
 * 
 * Properti:
 * - status: Status aplikasi magang (wajib diisi, harus sesuai enum StatusInternship).
 * - feedback: Umpan balik terkait aplikasi magang (opsional).
 * - startDate: Tanggal mulai magang (opsional, format ISO string).
 * - endDate: Tanggal selesai magang (opsional, format ISO string, hanya divalidasi jika startDate diisi).
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
   * Opsional dan harus berupa teks jika diisi.
   */
  @IsOptional()
  @IsString({ message: 'Feedback harus berupa teks.' })
  feedback?: string;

  /**
   * Tanggal mulai magang.
   * Opsional dan harus berupa string tanggal yang valid jika diisi.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  /**
   * Tanggal selesai magang.
   * Opsional, hanya divalidasi jika startDate diisi, dan harus berupa string tanggal yang valid.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  @ValidateIf((o) => o.startDate !== undefined)
  endDate?: string;
}
