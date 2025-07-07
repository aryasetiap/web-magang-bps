// src/logbooks/dto/create-logbook.dto.ts

import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateLogbookDto {
  @IsNotEmpty({ message: 'Tanggal log tidak boleh kosong.' })
  @IsDateString({}, { message: 'Format tanggal harus YYYY-MM-DD.' })
  logDate: string;

  @IsNotEmpty({ message: 'Isi kegiatan tidak boleh kosong.' })
  @IsString()
  @MinLength(10, { message: 'Isi kegiatan minimal harus 10 karakter.' })
  content: string;
}
