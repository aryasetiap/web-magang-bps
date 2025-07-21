import { IsString, IsInt, IsDateString } from 'class-validator';

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