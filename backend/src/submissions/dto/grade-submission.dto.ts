import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsIn,
} from 'class-validator';

export class GradeSubmissionDto {
  @IsNotEmpty({ message: 'Nilai tidak boleh kosong.' })
  @IsInt({ message: 'Nilai harus berupa angka bulat.' })
  @Min(0, { message: 'Nilai minimal adalah 0.' })
  @Max(100, { message: 'Nilai maksimal adalah 100.' })
  grade: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsIn(['reviewed', 'revisi'], {
    message: 'Status harus reviewed atau revisi.',
  })
  status?: 'reviewed' | 'revisi';
}
