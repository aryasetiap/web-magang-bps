import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClockOutDto {
  @ApiProperty({
    description: 'Latitude lokasi presensi pulang',
    example: -5.235,
  })
  @IsNumber({}, { message: 'Latitude harus berupa angka' })
  @IsNotEmpty({ message: 'Latitude tidak boleh kosong' })
  latitude: number;

  @ApiProperty({
    description: 'Longitude lokasi presensi pulang',
    example: 105.1572,
  })
  @IsNumber({}, { message: 'Longitude harus berupa angka' })
  @IsNotEmpty({ message: 'Longitude tidak boleh kosong' })
  longitude: number;
}
