import { IsDateString, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO untuk membuat entri logbook baru.
 * 
 * Properti:
 * - logDate: Tanggal log dalam format YYYY-MM-DD.
 * - content: Isi kegiatan yang dilakukan, minimal 10 karakter.
 */
export class CreateLogbookDto {
  /**
   * Tanggal log yang wajib diisi dengan format YYYY-MM-DD.
   */
  @IsNotEmpty({ message: 'Tanggal log tidak boleh kosong.' })
  @IsDateString({}, { message: 'Format tanggal harus YYYY-MM-DD.' })
  logDate: string;

  /**
   * Deskripsi kegiatan yang wajib diisi, minimal 10 karakter.
   */
  @IsNotEmpty({ message: 'Isi kegiatan tidak boleh kosong.' })
  @IsString()
  @MinLength(10, { message: 'Isi kegiatan minimal harus 10 karakter.' })
  content: string;
}
