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
 * DTO untuk memberikan penilaian pada submission.
 *
 * Properti:
 * - grade: Nilai yang diberikan (0-100), wajib diisi.
 * - feedback: Umpan balik opsional dari penilai.
 * - status: Status penilaian, hanya boleh 'reviewed' atau 'revisi'.
 */
export class GradeSubmissionDto {
  /**
   * Nilai yang diberikan pada submission.
   * Harus berupa angka bulat antara 0 sampai 100.
   */
  @IsNotEmpty({ message: 'Nilai tidak boleh kosong.' })
  @IsInt({ message: 'Nilai harus berupa angka bulat.' })
  @Min(0, { message: 'Nilai minimal adalah 0.' })
  @Max(100, { message: 'Nilai maksimal adalah 100.' })
  grade: number;

  /**
   * Umpan balik dari penilai (opsional).
   */
  @IsOptional()
  @IsString()
  feedback?: string;

  /**
   * Status penilaian, hanya boleh 'reviewed' atau 'revisi' (opsional).
   */
  @IsOptional()
  @IsIn(['reviewed', 'revisi'], {
    message: 'Status harus reviewed atau revisi.',
  })
  status?: 'reviewed' | 'revisi';
}
