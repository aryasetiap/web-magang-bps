/**
 * Modul DTO untuk memperbarui data aplikasi magang.
 *
 * Modul ini mendefinisikan kelas DTO yang digunakan untuk melakukan update
 * pada data aplikasi magang. Semua properti bersifat opsional agar dapat
 * memperbarui sebagian data saja.
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateInternshipApplicationDto } from './create-internship-application.dto';

/**
 * Kelas DTO untuk memperbarui aplikasi magang.
 *
 * Kelas ini mewarisi seluruh properti dari CreateInternshipApplicationDto,
 * namun menjadikannya opsional menggunakan PartialType. Hal ini memungkinkan
 * pembaruan sebagian data aplikasi magang.
 *
 * @extends PartialType<CreateInternshipApplicationDto>
 */
export class UpdateInternshipApplicationDto extends PartialType(
  CreateInternshipApplicationDto,
) {}
