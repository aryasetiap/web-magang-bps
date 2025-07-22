import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object untuk presensi pulang (clock out).
 * Berisi informasi lokasi berupa latitude dan longitude.
 */
export class ClockOutDto {
  /**
   * Latitude lokasi presensi pulang.
   * Contoh: -5.235
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
   * Contoh: 105.1572
   */
  @ApiProperty({
    description: 'Longitude lokasi presensi pulang',
    example: 105.1572,
  })
  @IsNumber({}, { message: 'Longitude harus berupa angka' })
  @IsNotEmpty({ message: 'Longitude tidak boleh kosong' })
  longitude: number;
}
