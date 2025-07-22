import { IsOptional, IsDateString, ValidateIf } from 'class-validator';

/**
 * DTO untuk membuat aplikasi magang baru.
 * 
 * Properti:
 * - startDate: Tanggal mulai magang (opsional, format ISO string).
 * - endDate: Tanggal selesai magang (opsional, format ISO string, hanya divalidasi jika startDate ada).
 */
export class CreateInternshipApplicationDto {
  /**
   * Tanggal mulai magang (opsional).
   * Harus berupa string tanggal yang valid jika diisi.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  /**
   * Tanggal selesai magang (opsional).
   * Hanya divalidasi jika startDate diisi.
   * Harus berupa string tanggal yang valid jika diisi.
   */
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  @ValidateIf((o) => o.startDate !== undefined)
  endDate?: string;
}
