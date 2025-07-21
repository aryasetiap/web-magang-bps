import { PartialType } from '@nestjs/mapped-types';
import { CreateFinalProjectDto } from './create-final-project.dto';

/**
 * DTO untuk memperbarui data Final Project.
 *
 * Kelas ini mewarisi seluruh properti dari CreateFinalProjectDto,
 * namun seluruh field bersifat opsional untuk keperluan update.
 */
export class UpdateFinalProjectDto extends PartialType(CreateFinalProjectDto) { }
