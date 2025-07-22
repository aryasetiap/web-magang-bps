import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';

/**
 * AttendancesModule is responsible for managing attendance-related features,
 * including providing the AttendancesService and registering the AttendancesController.
 */
@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
