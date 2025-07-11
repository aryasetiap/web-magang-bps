import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Body,
  Ip,
  Post,
  Patch,
  Param,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { ClockInDto } from './dto/clock-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  // PASTIKAN INI DULU
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllAttendances(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.attendancesService.findAllForAdmin(Number(page), Number(limit));
  }

  // BARU INI
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(+id);
  }
}
