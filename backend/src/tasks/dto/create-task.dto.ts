// src/tasks/dto/create-task.dto.ts

import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsArray({ message: 'internIds harus berupa array.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds?: number[];
}
