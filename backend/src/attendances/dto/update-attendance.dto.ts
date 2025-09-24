/**
 * Modul DTO untuk memperbarui data kehadiran.
 *
 * Modul ini mendefinisikan struktur data yang digunakan saat melakukan pembaruan (update)
 * pada entitas kehadiran. Semua field bersifat opsional dan diturunkan dari CreateAttendanceDto.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

/**
 * Data Transfer Object (DTO) untuk memperbarui data kehadiran.
 *
 * Kelas ini mewarisi seluruh properti dari CreateAttendanceDto, namun seluruh field menjadi opsional.
 * Digunakan sebagai tipe data pada operasi update kehadiran.
 *
 * @extends PartialType<CreateAttendanceDto>
 */
export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
