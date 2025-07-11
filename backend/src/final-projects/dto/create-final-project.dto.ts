import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFinalProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
