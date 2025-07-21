import { IsString, IsInt } from 'class-validator';

/**
 * DTO untuk membuat sertifikat baru.
 * Berisi informasi nomor sertifikat, ID pengguna, predikat,
 * nama kepala BPS, dan NIP kepala BPS.
 */
export class CreateCertificateDto {
    @IsString()
    certificateNumber: string;

    @IsInt()
    userId: number;

    @IsString()
    predicate: string;

    @IsString()
    namaKepalaBPS: string;

    @IsString()
    nipKepalaBPS: string;
}