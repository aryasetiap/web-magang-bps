/**
 * Modul DTO untuk memperbarui data Final Project.
 *
 * Modul ini mendefinisikan struktur data yang digunakan saat melakukan update
 * pada entitas Final Project. Seluruh field bersifat opsional agar dapat
 * digunakan untuk pembaruan parsial.
 *
 * @module UpdateFinalProjectDto
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateFinalProjectDto } from './create-final-project.dto';

/**
 * Data Transfer Object (DTO) untuk memperbarui data Final Project.
 *
 * Kelas ini mewarisi seluruh properti dari CreateFinalProjectDto,
 * namun seluruh field bersifat opsional untuk keperluan update parsial.
 *
 * @class
 * @extends PartialType(CreateFinalProjectDto)
 */
export class UpdateFinalProjectDto extends PartialType(CreateFinalProjectDto) {}
