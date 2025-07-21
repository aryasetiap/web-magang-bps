import { IsString, IsOptional } from 'class-validator';

/**
 * DTO untuk membuat data Final Project.
 *
 * Properti:
 * - title: Judul dari final project (wajib diisi).
 * - description: Deskripsi final project (opsional).
 */
export class CreateFinalProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
