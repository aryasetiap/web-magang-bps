/**
 * Modul DTO untuk memperbarui status sertifikat.
 * Berisi enum status sertifikat dan kelas DTO validasi status.
 *
 * @module UpdateCertificateStatusDto
 */

import { IsEnum } from 'class-validator';

/**
 * Enum CertificateStatusDto
 *
 * Merepresentasikan status yang dapat dimiliki oleh sebuah sertifikat.
 * - generated: Sertifikat telah dibuat.
 * - signed: Sertifikat telah ditandatangani.
 * - issued: Sertifikat telah diterbitkan.
 */
export enum CertificateStatusDto {
  generated = 'generated',
  signed = 'signed',
  issued = 'issued',
}

/**
 * Kelas UpdateCertificateStatusDto
 *
 * DTO untuk memperbarui status sertifikat.
 *
 * @property {CertificateStatusDto} status - Status baru sertifikat, harus sesuai dengan enum CertificateStatusDto.
 */
export class UpdateCertificateStatusDto {
  /**
   * Status baru sertifikat.
   * Hanya dapat diisi dengan nilai dari CertificateStatusDto.
   */
  @IsEnum(CertificateStatusDto)
  status: CertificateStatusDto;
}
