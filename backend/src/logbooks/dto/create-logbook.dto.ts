/**
 * Modul DTO untuk pembuatan entri logbook baru.
 *
 * Berisi definisi kelas dan validasi untuk data yang diperlukan saat membuat logbook.
 *
 * @module CreateLogbookDto
 */

import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk membuat entri logbook baru.
 *
 * Digunakan untuk memvalidasi data input saat pembuatan logbook.
 *
 * Properti:
 * - logDate: Tanggal log dalam format YYYY-MM-DD.
 * - content: Deskripsi kegiatan minimal 10 karakter.
 */
export class CreateLogbookDto {
  /**
   * Tanggal log yang wajib diisi dengan format YYYY-MM-DD.
   *
   * @type {string}
   */
  @IsNotEmpty({ message: 'Tanggal log tidak boleh kosong.' })
  @IsDateString({}, { message: 'Format tanggal harus YYYY-MM-DD.' })
  logDate!: string;

  /**
   * Deskripsi kegiatan yang wajib diisi, minimal 10 karakter.
   *
   * @type {string}
   */
  @IsNotEmpty({ message: 'Isi kegiatan tidak boleh kosong.' })
  @IsString({ message: 'Isi kegiatan harus berupa teks.' })
  @MinLength(10, { message: 'Isi kegiatan minimal harus 10 karakter.' })
  content!: string;
}
