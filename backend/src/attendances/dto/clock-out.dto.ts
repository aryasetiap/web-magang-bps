/**
 * Modul DTO untuk presensi pulang (clock out).
 * Berisi definisi struktur data yang digunakan saat melakukan presensi pulang,
 * termasuk validasi dan dokumentasi Swagger.
 */

import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object (DTO) untuk presensi pulang.
 *
 * Digunakan untuk menerima data lokasi (latitude dan longitude) saat user melakukan clock out.
 *
 * @property latitude - Latitude lokasi presensi pulang.
 * @property longitude - Longitude lokasi presensi pulang.
 */
export class ClockOutDto {
  /**
   * Latitude lokasi presensi pulang.
   * Wajib diisi dan harus berupa angka.
   *
   * @example -5.235
   */
  @ApiProperty({
    description: 'Latitude lokasi presensi pulang',
    example: -5.235,
  })
  @IsNumber({}, { message: 'Latitude harus berupa angka' })
  @IsNotEmpty({ message: 'Latitude tidak boleh kosong' })
  latitude: number;

  /**
   * Longitude lokasi presensi pulang.
   * Wajib diisi dan harus berupa angka.
   *
   * @example 105.1572
   */
  @ApiProperty({
    description: 'Longitude lokasi presensi pulang',
    example: 105.1572,
  })
  @IsNumber({}, { message: 'Longitude harus berupa angka' })
  @IsNotEmpty({ message: 'Longitude tidak boleh kosong' })
  longitude: number;
}
