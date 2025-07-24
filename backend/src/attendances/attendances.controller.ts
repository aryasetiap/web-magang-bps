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
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { AuthGuard } from '@nestjs/passport';
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
import { RequestLeaveDto } from './dto/request-leave.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@ApiTags('attendances')
@Controller('attendances')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  /**
   * Melakukan presensi masuk (clock-in).
   * @param req Request object yang berisi user.
   * @param clockInDto Data presensi masuk.
   * @param ip Alamat IP pengguna.
   */
  @Post('clock-in')
  @ApiOperation({ summary: 'Melakukan presensi masuk (clock-in)' })
  clockIn(@Request() req, @Body() clockInDto: ClockInDto, @Ip() ip: string) {
    const userId = req.user.userId;
    return this.attendancesService.clockIn(userId, clockInDto, ip);
  }

  /**
   * Melakukan presensi pulang (clock-out) dengan validasi lokasi.
   * @param clockOutDto Data presensi pulang.
   * @param req Request object yang berisi user dan IP.
   */
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
    const userId = req.user.userId;
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

  /**
   * Mendapatkan riwayat presensi pengguna saat ini.
   * @param req Request object yang berisi user.
   */
  @Get()
  @ApiOperation({ summary: 'Melihat riwayat presensi sendiri' })
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.attendancesService.findAll(userId);
  }

  /**
   * Mendapatkan seluruh data presensi (khusus admin).
   * @param page Halaman data.
   * @param limit Jumlah data per halaman.
   */
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Melihat seluruh data presensi (admin)' })
  async getAllAttendances(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.attendancesService.findAllForAdmin(Number(page), Number(limit));
  }

  /**
   * Mendapatkan detail presensi berdasarkan ID.
   * @param id ID presensi.
   */

  @Get('report')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export rekap presensi semua intern ke PDF' })
  async exportAllAttendancesPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('institution') institution: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const adminName = req.user?.name || 'Admin';
    const pdfBuffer = await this.attendancesService.exportAllAttendancesPdf(
      { startDate, endDate, institution },
      adminName,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rekap-presensi.pdf"`,
    });
    res.end(pdfBuffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail presensi berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(+id);
  }

  /**
   * Mengajukan permohonan cuti/izin dengan upload bukti.
   * @param req Request object yang berisi user.
   * @param dto Data permohonan cuti/izin.
   * @param file File bukti (opsional).
   */
  @Post('request-leave')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: './uploads/proofs',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
        if (allowed.includes(extname(file.originalname).toLowerCase())) {
          cb(null, true);
        } else {
          cb(new Error('File harus JPG, PNG, atau PDF'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Mengajukan permohonan cuti/izin' })
  async requestLeave(
    @Request() req,
    @Body() dto: RequestLeaveDto,
    @UploadedFile() file: Express.Multer.File | null,
  ) {
    const userId = req.user.userId;
    return this.attendancesService.requestLeave(userId, dto, file);
  }

  /**
   * Memvalidasi permohonan cuti/izin (admin/staff).
   * @param id ID permohonan.
   * @param status Status validasi.
   * @param req Request object yang berisi user.
   */
  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Validasi permohonan cuti/izin (admin/staff)' })
  async validateLeave(
    @Param('id') id: string,
    @Body('status') status: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan',
    @Request() req,
  ) {
    const adminId = req.user.userId;
    return this.attendancesService.validateLeave(+id, status, adminId);
  }

  @Get(':userId/report')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export presensi satu intern ke PDF' })
  async exportUserAttendancePdf(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const adminName = req.user?.name || 'Admin';
    const pdfBuffer = await this.attendancesService.exportUserAttendancePdf(
      Number(userId),
      { startDate, endDate },
      adminName,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="presensi-intern-${userId}.pdf"`,
    });
    res.end(pdfBuffer);
  }
}
