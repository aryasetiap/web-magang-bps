import { IsEnum } from 'class-validator';

export enum CertificateStatusDto {
    generated = 'generated',
    signed = 'signed',
    issued = 'issued',
}

export class UpdateCertificateStatusDto {
    @IsEnum(CertificateStatusDto)
    status: CertificateStatusDto;
}