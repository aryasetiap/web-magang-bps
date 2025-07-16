// src/tasks/dto/create-task.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul tugas tidak boleh kosong.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Deadline tidak boleh kosong.' })
  deadline: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map((v) => Number(v.trim()));
      }
      return [Number(value)];
    }
    return [];
  })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds?: number[];
}
