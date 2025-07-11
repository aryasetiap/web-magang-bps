import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class ReviewFinalProjectDto {
  @IsEnum(['accepted', 'revision'], {
    message: 'Status harus berupa accepted atau revision',
  })
  status: 'accepted' | 'revision';

  @IsOptional()
  @IsNumber({}, { message: 'Grade harus berupa angka' })
  @Min(0, { message: 'Grade minimal 0' })
  @Max(100, { message: 'Grade maksimal 100' })
  grade?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
