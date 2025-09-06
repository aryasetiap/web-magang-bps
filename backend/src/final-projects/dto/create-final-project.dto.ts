/**
 * Modul DTO untuk pembuatan data Final Project.
 *
 * Berisi kelas dan tipe data yang digunakan untuk validasi input saat membuat final project.
 */

import { IsString, IsOptional } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk membuat Final Project.
 *
 * Properti:
 * - title: Judul dari final project (wajib diisi).
 * - description: Deskripsi final project (opsional).
 */
export class CreateFinalProjectDto {
  /**
   * Judul dari final project.
   */
  @IsString()
  title: string;

  /**
   * Deskripsi final project (opsional).
   */
  @IsOptional()
  @IsString()
  description?: string;
}
