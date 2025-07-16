import { IsString, IsNumber, IsIn } from 'class-validator';

export class ReviewFinalProjectDto {
  @IsIn(['reviewed', 'accepted', 'revisi'])
  status: 'reviewed' | 'accepted' | 'revisi';

  @IsNumber()
  grade: number;

  @IsString()
  feedback: string;
}
