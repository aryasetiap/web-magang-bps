import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  Query,
  Param,
  Ip,
  Request, // Tambahkan Request dari @nestjs/common
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { AuthGuard } from '@nestjs/passport'; // Ganti dengan ini
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('attendances')
@Controller('attendances')
@UseGuards(AuthGuard('jwt')) // Ganti dengan ini
@ApiBearerAuth()
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  // Endpoint spesifik untuk Clock In
  @Post('clock-in')
  clockIn(@Request() req, @Body() clockInDto: ClockInDto, @Ip() ip: string) {
    const userId = req.user.userId;
    return this.attendancesService.clockIn(userId, clockInDto, ip);
  }

  @Patch('clock-out')
  @ApiOperation({ summary: 'Melakukan presensi pulang dengan validasi lokasi' })
  @ApiBody({ type: ClockOutDto })
  @ApiResponse({
    status: 200,
    description: 'Presensi pulang berhasil',
    schema: {
      example: {
        message: 'Presensi pulang berhasil',
        attendance: {
          id: 1,
          clockIn: '2025-01-15T08:00:00Z',
          clockOut: '2025-01-15T17:00:00Z',
          latitude: -5.235,
          longitude: 105.1572,
          userId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Lokasi tidak valid',
    schema: {
      example: {
        statusCode: 403,
        message:
          'Anda harus berada dalam radius 50 meter dari kantor. Jarak Anda: 120 meter.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tidak ada data presensi masuk',
    schema: {
      example: {
        statusCode: 404,
        message:
          'Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu.',
      },
    },
  })
  async clockOut(@Body() clockOutDto: ClockOutDto, @Req() req: any) {
    const userId = req.user.userId; // Sudah benar!
    const ipAddress = req.ip || req.connection.remoteAddress;

    const attendance = await this.attendancesService.clockOut(
      userId,
      clockOutDto,
      ipAddress,
    );

    return {
      message: 'Presensi pulang berhasil',
      attendance: {
        ...attendance,
        clockOutCoordinates: {
          latitude: attendance.clockOutLatitude,
          longitude: attendance.clockOutLongitude,
        },
      },
    };
  }

  // Endpoint untuk melihat riwayat presensi sendiri
  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.attendancesService.findAll(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllAttendances(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.attendancesService.findAllForAdmin(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(+id);
  }
}
