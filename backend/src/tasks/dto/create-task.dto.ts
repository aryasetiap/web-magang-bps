// src/tasks/dto/create-task.dto.ts

import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul tugas tidak boleh kosong.' })
  @MinLength(5, { message: 'Judul tugas minimal harus 5 karakter.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong.' })
  description: string;

  @IsNotEmpty({ message: 'Deadline tidak boleh kosong.' })
  @IsDateString({}, { message: 'Format deadline harus YYYY-MM-DD.' })
  deadline: string;
}
