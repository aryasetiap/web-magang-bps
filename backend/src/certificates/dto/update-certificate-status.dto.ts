import { IsEnum } from 'class-validator';

/**
 * Enum yang merepresentasikan status sertifikat.
 */
export enum CertificateStatusDto {
    generated = 'generated',
    signed = 'signed',
    issued = 'issued',
}

/**
 * DTO untuk memperbarui status sertifikat.
 * Properti 'status' hanya dapat diisi dengan nilai dari CertificateStatusDto.
 */
export class UpdateCertificateStatusDto {
    @IsEnum(CertificateStatusDto)
    status: CertificateStatusDto;
}