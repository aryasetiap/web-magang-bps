import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';

/**
 * Modul AttendancesModule bertanggung jawab untuk mengelola fitur terkait absensi.
 * Modul ini mendaftarkan AttendancesController dan menyediakan AttendancesService
 * sebagai dependency injection untuk kebutuhan pengelolaan absensi.
 */
@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}
