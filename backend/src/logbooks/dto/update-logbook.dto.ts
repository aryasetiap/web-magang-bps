/**
 * Modul DTO untuk memperbarui data logbook.
 * Berisi kelas UpdateLogbookDto yang digunakan untuk validasi dan transfer data saat update logbook.
 *
 * @module UpdateLogbookDto
 */

import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateLogbookDto } from './create-logbook.dto';

/**
 * Data Transfer Object (DTO) untuk memperbarui data logbook.
 *
 * Kelas ini menurunkan seluruh properti dari CreateLogbookDto secara opsional,
 * dan menambahkan validasi pada setiap field yang dapat diubah.
 *
 * @class
 * @extends PartialType(CreateLogbookDto)
 *
 * @property {string} [logDate] - Tanggal logbook dalam format ISO string (opsional).
 * @property {string} [content] - Konten atau isi logbook (opsional).
 * @property {string} [status] - Status logbook, hanya boleh 'draft' atau 'submitted' (opsional).
 */
export class UpdateLogbookDto extends PartialType(CreateLogbookDto) {
  /**
   * Tanggal logbook dalam format ISO string.
   * Opsional, hanya diisi jika ingin mengubah tanggal.
   *
   * @type {string}
   */
  @IsOptional()
  @IsDateString()
  logDate?: string;

  /**
   * Konten atau isi logbook.
   * Opsional, hanya diisi jika ingin mengubah konten.
   *
   * @type {string}
   */
  @IsOptional()
  @IsString()
  content?: string;

  /**
   * Status logbook, hanya boleh bernilai 'draft' atau 'submitted'.
   * Opsional, hanya diisi jika ingin mengubah status.
   *
   * @type {string}
   */
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'submitted'])
  status?: string;
}
