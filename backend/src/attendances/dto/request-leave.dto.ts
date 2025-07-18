import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LeaveType {
  sakit = 'sakit',
  izin = 'izin',
}

export class RequestLeaveDto {
  @ApiProperty({ enum: LeaveType, description: 'Jenis pengajuan: sakit/izin' })
  @IsEnum(LeaveType, { message: 'Jenis pengajuan harus sakit atau izin' })
  type: LeaveType;

  @ApiProperty({ description: 'Deskripsi alasan tidak hadir' })
  @IsNotEmpty({ message: 'Deskripsi alasan wajib diisi' })
  @IsString()
  description: string;

  // File akan divalidasi di controller (multer)
}
