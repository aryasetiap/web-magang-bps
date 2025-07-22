import { IsOptional, IsString } from 'class-validator';

/**
 * DTO untuk membuat entri submission baru.
 *
 * Properti:
 * - description: Deskripsi tambahan untuk submission (opsional).
 */
export class CreateSubmissionDto {
  @IsOptional()
  @IsString()
  description?: string;
}
