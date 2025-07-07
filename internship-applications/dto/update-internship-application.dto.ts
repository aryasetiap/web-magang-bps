import { PartialType } from '@nestjs/mapped-types';
import { CreateInternshipApplicationDto } from './create-internship-application.dto';

export class UpdateInternshipApplicationDto extends PartialType(CreateInternshipApplicationDto) {}
