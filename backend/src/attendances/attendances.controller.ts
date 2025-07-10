import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Ip,
  Patch, // <-- pastikan Patch diimpor
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { ClockInDto } from './dto/clock-in.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('attendances')
@UseGuards(AuthGuard('jwt'))
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  // Endpoint spesifik untuk Clock In
  @Post('clock-in')
  clockIn(@Request() req, @Body() clockInDto: ClockInDto, @Ip() ip: string) {
    const userId = req.user.userId;
    return this.attendancesService.clockIn(userId, clockInDto, ip);
  }

  // TAMBAHKAN METHOD BARU INI
  @Patch('clock-out')
  clockOut(@Request() req) {
    const userId = req.user.userId;
    return this.attendancesService.clockOut(userId);
  }

  // Endpoint untuk melihat riwayat presensi sendiri
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.attendancesService.findAll(userId);
  }

  // Endpoint untuk melihat detail satu presensi
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(+id);
  }

  // Kita hapus method create, update, remove yang lama karena tidak digunakan
}
