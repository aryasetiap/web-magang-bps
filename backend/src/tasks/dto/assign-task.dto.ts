/**
 * Modul DTO untuk meng-assign tugas kepada satu atau lebih intern.
 *
 * Berisi definisi AssignTaskDto yang memvalidasi dan mentransformasi input ID intern.
 */

import { IsInt, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object (DTO) untuk meng-assign tugas kepada satu atau lebih intern.
 *
 * Properti:
 * - internIds: Array berisi ID intern yang akan ditugaskan.
 *   Mendukung input berupa array angka, string angka yang dipisahkan koma, atau string angka tunggal.
 */
export class AssignTaskDto {
  /**
   * Transformasi dan validasi input menjadi array angka.
   *
   * @param value - Input yang dapat berupa array angka, string angka dipisahkan koma, atau string angka tunggal.
   * @returns Array angka hasil transformasi dari input.
   */
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      return value.split(',').map((v) => Number(v.trim()));
    }
    return [];
  })
  @ArrayNotEmpty({ message: 'Pilih setidaknya satu intern untuk ditugaskan.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds: number[];
}
