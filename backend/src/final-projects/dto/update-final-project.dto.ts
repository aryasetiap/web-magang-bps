import { PartialType } from '@nestjs/mapped-types';
import { CreateFinalProjectDto } from './create-final-project.dto';

export class UpdateFinalProjectDto extends PartialType(CreateFinalProjectDto) {}
