// src/attendances/dto/clock-in.dto.ts

import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class ClockInDto {
  @IsNotEmpty({ message: 'Latitude tidak boleh kosong.' })
  @IsLatitude({ message: 'Format latitude tidak valid.' })
  latitude: number;

  @IsNotEmpty({ message: 'Longitude tidak boleh kosong.' })
  @IsLongitude({ message: 'Format longitude tidak valid.' })
  longitude: number;
}
