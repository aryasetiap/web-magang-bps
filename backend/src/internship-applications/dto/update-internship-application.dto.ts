import { PartialType } from '@nestjs/mapped-types';
import { CreateInternshipApplicationDto } from './create-internship-application.dto';

/**
 * DTO untuk memperbarui data aplikasi magang.
 * 
 * Kelas ini menggunakan PartialType agar semua properti dari
 * CreateInternshipApplicationDto menjadi opsional saat melakukan update.
 */
export class UpdateInternshipApplicationDto extends PartialType(CreateInternshipApplicationDto) { }
