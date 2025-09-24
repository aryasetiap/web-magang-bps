/**
 * Modul DTO untuk proses clock-in absensi.
 * Berisi definisi struktur data dan validasi input untuk clock-in.
 *
 * @module ClockInDto
 */

import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk permintaan clock-in absensi.
 *
 * DTO ini memastikan bahwa data latitude dan longitude yang dikirimkan
 * oleh pengguna telah terisi dan memiliki format yang valid.
 *
 * @class
 * @property {number} latitude - Koordinat latitude lokasi clock-in.
 * @property {number} longitude - Koordinat longitude lokasi clock-in.
 */
export class ClockInDto {
  /**
   * Koordinat latitude lokasi clock-in.
   * Wajib diisi dan harus berupa format latitude yang valid.
   */
  @IsNotEmpty({ message: 'Latitude tidak boleh kosong.' })
  @IsLatitude({ message: 'Format latitude tidak valid.' })
  latitude: number;

  /**
   * Koordinat longitude lokasi clock-in.
   * Wajib diisi dan harus berupa format longitude yang valid.
   */
  @IsNotEmpty({ message: 'Longitude tidak boleh kosong.' })
  @IsLongitude({ message: 'Format longitude tidak valid.' })
  longitude: number;
}
