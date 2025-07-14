// src/internship-applications/dto/create-internship-application.dto.ts
import { IsOptional, IsDateString, ValidateIf } from 'class-validator';

export class CreateInternshipApplicationDto {
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  @ValidateIf((o) => o.startDate !== undefined)
  endDate?: string;
}
