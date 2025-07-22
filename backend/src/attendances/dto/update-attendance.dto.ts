import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

/**
 * Data Transfer Object for updating attendance records.
 * Inherits all fields from CreateAttendanceDto as optional.
 */
export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
