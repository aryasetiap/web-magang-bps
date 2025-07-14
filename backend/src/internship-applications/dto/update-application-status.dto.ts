// src/internship-applications/dto/update-application-status.dto.ts

import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { StatusInternship } from '@prisma/client';

export class UpdateApplicationStatusDto {
  @IsEnum(StatusInternship, {
    message: 'Status harus salah satu dari: pending, diterima, ditolak',
  })
  status: StatusInternship;

  @IsOptional()
  @IsString({ message: 'Feedback harus berupa teks.' })
  feedback?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai magang tidak valid' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai magang tidak valid' })
  @ValidateIf((o) => o.startDate !== undefined)
  endDate?: string;
}
