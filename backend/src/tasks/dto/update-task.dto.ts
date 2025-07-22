import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO untuk memperbarui data tugas.
 * 
 * Kelas ini menggunakan PartialType untuk membuat semua properti dari CreateTaskDto menjadi opsional,
 * sehingga dapat digunakan untuk operasi update sebagian pada entitas tugas.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
