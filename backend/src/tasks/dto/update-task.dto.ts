/**
 * Modul DTO untuk memperbarui data tugas.
 *
 * Modul ini mendefinisikan kelas UpdateTaskDto yang digunakan untuk
 * melakukan update sebagian pada entitas tugas. Kelas ini mewarisi
 * properti dari CreateTaskDto dan menjadikannya opsional.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * Kelas DTO untuk memperbarui data tugas.
 *
 * Kelas ini menggunakan PartialType untuk membuat semua properti dari
 * CreateTaskDto menjadi opsional, sehingga dapat digunakan untuk operasi
 * update sebagian pada entitas tugas.
 *
 * @extends PartialType(CreateTaskDto)
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
