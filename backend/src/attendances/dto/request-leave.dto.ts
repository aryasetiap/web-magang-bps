import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum representing the types of leave requests.
 */
export enum LeaveType {
  sakit = 'sakit',
  izin = 'izin',
}

/**
 * Data Transfer Object for submitting a leave request.
 */
export class RequestLeaveDto {
  /**
   * The type of leave request: 'sakit' (sick) or 'izin' (permission).
   */
  @ApiProperty({ enum: LeaveType, description: 'Jenis pengajuan: sakit/izin' })
  @IsEnum(LeaveType, { message: 'Jenis pengajuan harus sakit atau izin' })
  type: LeaveType;

  /**
   * Description or reason for the leave request.
   */
  @ApiProperty({ description: 'Deskripsi alasan tidak hadir' })
  @IsNotEmpty({ message: 'Deskripsi alasan wajib diisi' })
  @IsString()
  description: string;
}
