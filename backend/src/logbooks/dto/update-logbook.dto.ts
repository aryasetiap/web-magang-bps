// src/logbooks/dto/update-logbook.dto.ts

import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateLogbookDto } from './create-logbook.dto';

export class UpdateLogbookDto extends PartialType(CreateLogbookDto) {
  @IsOptional()
  @IsDateString()
  logDate?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'submitted'])
  status?: string;
}
