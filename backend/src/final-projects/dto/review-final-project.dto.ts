import { IsString, IsNumber, IsIn } from 'class-validator';

export class ReviewFinalProjectDto {
  @IsIn(['reviewed', 'accepted', 'revision'])
  status: 'reviewed' | 'accepted' | 'revision';

  @IsNumber()
  grade: number;

  @IsString()
  feedback: string;
}
