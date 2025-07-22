import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateLogbookDto } from './create-logbook.dto';

/**
 * DTO untuk memperbarui data logbook.
 * Semua properti bersifat opsional dan akan divalidasi sesuai tipe datanya.
 */
export class UpdateLogbookDto extends PartialType(CreateLogbookDto) {
  /**
   * Tanggal logbook dalam format ISO string.
   * Opsional, hanya diisi jika ingin mengubah tanggal.
   */
  @IsOptional()
  @IsDateString()
  logDate?: string;

  /**
   * Konten atau isi logbook.
   * Opsional, hanya diisi jika ingin mengubah konten.
   */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * Status logbook, hanya boleh bernilai 'draft' atau 'submitted'.
   * Opsional, hanya diisi jika ingin mengubah status.
   */
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'submitted'])
  status?: string;
}
