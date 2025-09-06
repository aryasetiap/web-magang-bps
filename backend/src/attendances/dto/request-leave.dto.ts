/**
 * Modul DTO untuk pengajuan cuti (leave request).
 * Berisi definisi tipe data dan validasi untuk permintaan cuti.
 *
 * @module RequestLeaveDto
 */

import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum LeaveType
 *
 * Enum yang merepresentasikan jenis pengajuan cuti.
 * - sakit: Pengajuan cuti karena sakit.
 * - izin: Pengajuan cuti karena izin.
 */
export enum LeaveType {
  sakit = 'sakit',
  izin = 'izin',
}

/**
 * Kelas RequestLeaveDto
 *
 * DTO untuk menerima data permintaan cuti.
 *
 * @property {LeaveType} type - Jenis pengajuan cuti ('sakit' atau 'izin').
 * @property {string} description - Deskripsi atau alasan pengajuan cuti.
 */
export class RequestLeaveDto {
  /**
   * Jenis pengajuan cuti: 'sakit' (sakit) atau 'izin' (izin).
   *
   * @type {LeaveType}
   */
  @ApiProperty({ enum: LeaveType, description: 'Jenis pengajuan: sakit/izin' })
  @IsEnum(LeaveType, { message: 'Jenis pengajuan harus sakit atau izin' })
  type: LeaveType;

  /**
   * Deskripsi atau alasan pengajuan cuti.
   *
   * @type {string}
   */
  @ApiProperty({ description: 'Deskripsi alasan tidak hadir' })
  @IsNotEmpty({ message: 'Deskripsi alasan wajib diisi' })
  @IsString({ message: 'Deskripsi alasan harus berupa teks' })
  description: string;
}
