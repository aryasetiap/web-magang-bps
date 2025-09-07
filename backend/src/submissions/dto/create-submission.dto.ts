/**
 * Modul DTO untuk membuat entri submission baru.
 *
 * Berisi definisi kelas DTO yang digunakan untuk validasi data saat membuat submission.
 */

import { IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk pembuatan submission baru.
 *
 * Properti:
 * - description (opsional): Deskripsi tambahan terkait submission.
 */
export class CreateSubmissionDto {
  /**
   * Deskripsi tambahan untuk submission.
   * Opsional, berupa string.
   */
  @IsOptional()
  @IsString()
  description?: string;
}
