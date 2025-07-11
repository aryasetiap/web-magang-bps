import { IsOptional, IsString } from 'class-validator';

export class UploadCertificateDto {
  @IsOptional()
  @IsString()
  notes?: string; // Catatan admin saat upload
}
