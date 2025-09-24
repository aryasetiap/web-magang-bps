/**
 * Modul DTO untuk review final project.
 *
 * Berisi definisi struktur data yang digunakan untuk melakukan review terhadap final project,
 * termasuk status review, nilai, dan umpan balik.
 */

import { IsString, IsNumber, IsIn } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk melakukan review pada final project.
 *
 * Properti:
 * - status: Status review, hanya boleh 'reviewed', 'accepted', atau 'revisi'.
 * - grade: Nilai numerik yang diberikan pada final project.
 * - feedback: Umpan balik atau komentar terhadap final project.
 */
export class ReviewFinalProjectDto {
  /**
   * Status review final project.
   * Hanya dapat bernilai 'reviewed', 'accepted', atau 'revisi'.
   */
  @IsIn(['reviewed', 'accepted', 'revisi'])
  status: 'reviewed' | 'accepted' | 'revisi';

  /**
   * Nilai numerik yang diberikan pada final project.
   */
  @IsNumber({ allowNaN: false, allowInfinity: false })
  grade: number;

  /**
   * Umpan balik atau komentar terhadap final project.
   */
  @IsString()
  feedback: string;
}
