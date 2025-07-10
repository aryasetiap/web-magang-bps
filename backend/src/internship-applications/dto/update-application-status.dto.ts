// src/internship-applications/dto/update-application-status.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusInternship } from '@prisma/client'; // Impor Enum dari Prisma Client

export class UpdateApplicationStatusDto {
  @IsEnum(StatusInternship, {
    message: 'Status harus salah satu dari: pending, diterima, ditolak',
  })
  status: StatusInternship;

  // [PENAMBAHAN] Tambahkan field feedback yang opsional
  @IsOptional()
  @IsString({ message: 'Feedback harus berupa teks.' })
  feedback?: string;
}
