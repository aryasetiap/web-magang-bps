/**
 * Modul DTO untuk penilaian submission.
 *
 * Berisi kelas GradeSubmissionDto yang digunakan untuk memvalidasi data penilaian submission,
 * termasuk nilai, umpan balik, dan status penilaian.
 *
 * @module GradeSubmissionDto
 */

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsIn,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk memberikan penilaian pada submission.
 *
 * Digunakan untuk memvalidasi data input penilaian, seperti nilai, umpan balik, dan status.
 *
 * @property {number} grade - Nilai yang diberikan (0-100), wajib diisi.
 * @property {string} [feedback] - Umpan balik opsional dari penilai.
 * @property {'reviewed' | 'revisi'} [status] - Status penilaian, hanya boleh 'reviewed' atau 'revisi'.
 */
export class GradeSubmissionDto {
  /**
   * Nilai yang diberikan pada submission.
   * Harus berupa angka bulat antara 0 sampai 100.
   *
   * @type {number}
   */
  @IsNotEmpty({ message: 'Nilai tidak boleh kosong.' })
  @IsInt({ message: 'Nilai harus berupa angka bulat.' })
  @Min(0, { message: 'Nilai minimal adalah 0.' })
  @Max(100, { message: 'Nilai maksimal adalah 100.' })
  grade: number;

  /**
   * Umpan balik dari penilai (opsional).
   *
   * @type {string}
   */
  @IsOptional()
  @IsString({ message: 'Feedback harus berupa string.' })
  feedback?: string;

  /**
   * Status penilaian, hanya boleh 'reviewed' atau 'revisi' (opsional).
   *
   * @type {'reviewed' | 'revisi'}
   */
  @IsOptional()
  @IsIn(['reviewed', 'revisi'], {
    message: 'Status harus reviewed atau revisi.',
  })
  status?: 'reviewed' | 'revisi';
}
