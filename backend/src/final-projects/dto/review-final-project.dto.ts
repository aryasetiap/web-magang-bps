import { IsString, IsNumber, IsIn } from 'class-validator';

/**
 * DTO untuk melakukan review pada final project.
 *
 * Properti:
 * - status: Status review, hanya boleh 'reviewed', 'accepted', atau 'revisi'.
 * - grade: Nilai yang diberikan pada final project.
 * - feedback: Umpan balik atau komentar terhadap final project.
 */
export class ReviewFinalProjectDto {
  @IsIn(['reviewed', 'accepted', 'revisi'])
  status: 'reviewed' | 'accepted' | 'revisi';

  @IsNumber({ allowNaN: false, allowInfinity: false })
  grade: number;

  @IsString()
  feedback: string;
}
