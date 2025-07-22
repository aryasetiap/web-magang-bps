import { IsInt, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO untuk meng-assign tugas kepada satu atau lebih intern.
 * 
 * Properti:
 * - internIds: Array berisi ID intern yang akan ditugaskan. 
 *   Mendukung input berupa array angka, string angka yang dipisahkan koma, atau string angka tunggal.
 */
export class AssignTaskDto {
  /**
   * Mengubah input menjadi array angka.
   * Mendukung input array, string dengan koma, atau string tunggal.
   */
  @Transform(({ value }) => {
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
  })
  @ArrayNotEmpty({ message: 'Pilih setidaknya satu intern untuk ditugaskan.' })
  @IsInt({ each: true, message: 'Setiap ID intern harus berupa angka.' })
  internIds: number[];
}
