/**
 * Modul DTO untuk membuat tugas baru.
 *
 * Berisi definisi kelas CreateTaskDto yang digunakan untuk validasi data
 * saat pembuatan tugas, termasuk judul, deskripsi, deadline, dan daftar ID intern.
 */

import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object (DTO) untuk membuat tugas baru.
 *
 * Properti:
 * - title: Judul tugas, wajib diisi.
 * - description: Deskripsi tugas, wajib diisi.
 * - deadline: Deadline tugas, wajib diisi.
 * - internIds: Daftar ID intern yang terkait dengan tugas, opsional.
 */
export class CreateTaskDto {
  /**
   * Judul tugas.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty({ message: 'Judul tugas tidak boleh kosong.' })
  title: string;

  /**
   * Deskripsi tugas.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong.' })
  description: string;

  /**
   * Deadline tugas.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty({ message: 'Deadline tidak boleh kosong.' })
  deadline: string;

  /**
   * Daftar ID intern yang terkait dengan tugas.
   * Bisa menerima array angka atau string yang dipisahkan koma.
   * @type {number[]}
   */
  @IsOptional()
  @Transform(({ value }) => transformInternIds(value))
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds?: number[];
}

/**
 * Fungsi utilitas untuk mentransformasi input internIds menjadi array angka.
 *
 * @param value - Nilai yang diterima, bisa berupa array atau string.
 * @returns Array angka hasil transformasi.
 */
function transformInternIds(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(Number);
  }
  if (typeof value === 'string') {
    if (value.includes(',')) {
      return value.split(',').map((v) => Number(v.trim()));
    }
    return [Number(value)];
  }
  return [];
}
