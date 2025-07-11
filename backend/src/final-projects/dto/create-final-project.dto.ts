import { IsString, IsOptional } from 'class-validator';

export class CreateFinalProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
