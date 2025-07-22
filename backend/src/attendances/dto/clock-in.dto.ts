import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object untuk proses clock-in absensi.
 * Memastikan latitude dan longitude diisi dan valid.
 */
export class ClockInDto {
  /**
   * Koordinat latitude lokasi clock-in.
   * Tidak boleh kosong dan harus format latitude yang valid.
   */
  @IsNotEmpty({ message: 'Latitude tidak boleh kosong.' })
  @IsLatitude({ message: 'Format latitude tidak valid.' })
  latitude: number;

  /**
   * Koordinat longitude lokasi clock-in.
   * Tidak boleh kosong dan harus format longitude yang valid.
   */
  @IsNotEmpty({ message: 'Longitude tidak boleh kosong.' })
  @IsLongitude({ message: 'Format longitude tidak valid.' })
  longitude: number;
}
