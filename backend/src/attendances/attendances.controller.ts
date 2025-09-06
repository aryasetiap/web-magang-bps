/**
 * AttendancesController Module
 * ---------------------------
 * Mengelola endpoint terkait presensi (clock-in, clock-out, riwayat, cuti/izin, dan ekspor laporan).
 * Setiap endpoint diamankan dengan JWT dan validasi peran (role) jika diperlukan.
 *
 * @module AttendancesController
 */

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
  BadRequestException,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

/**
 * Interface JwtRequest
 * --------------------
 * Mendefinisikan struktur request yang membawa data user dari JWT.
 */
interface JwtRequest extends Request {
  user?: { userId: number; name?: string };
  ip?: string;
  connection?: { remoteAddress?: string };
}

@ApiTags('attendances')
@Controller('attendances')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
/**
 * Kelas AttendancesController
 * --------------------------
 * Controller utama untuk mengelola presensi, cuti/izin, dan laporan.
 */
export class AttendancesController {
  /**
   * Konstruktor AttendancesController
   * @param attendancesService Service untuk mengelola logika presensi.
   */
  constructor(private readonly attendancesService: AttendancesService) {}

  /**
   * Endpoint presensi masuk (clock-in).
   *
   * @param req Request object yang berisi user.
   * @param clockInDto Data presensi masuk.
   * @param ip Alamat IP pengguna.
   * @returns Data presensi masuk yang berhasil dicatat.
   */
  @Post('clock-in')
  @ApiOperation({ summary: 'Melakukan presensi masuk (clock-in)' })
  clockIn(
    @Request() req: JwtRequest,
    @Body() clockInDto: ClockInDto,
    @Ip() ip: string,
  ) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    return this.attendancesService.clockIn(userId, clockInDto, ip);
  }

  /**
   * Endpoint presensi pulang (clock-out) dengan validasi lokasi.
   *
   * @param clockOutDto Data presensi pulang.
   * @param req Request object yang berisi user.
   * @returns Data presensi pulang yang berhasil dicatat.
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
  async clockOut(@Body() clockOutDto: ClockOutDto, @Req() req: JwtRequest) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    const attendance = await this.attendancesService.clockOut(
      userId,
      clockOutDto,
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
   * Endpoint mendapatkan riwayat presensi pengguna saat ini.
   *
   * @param req Request object yang berisi user.
   * @returns Daftar riwayat presensi pengguna.
   */
  @Get()
  @ApiOperation({ summary: 'Melihat riwayat presensi sendiri' })
  findAll(@Request() req: JwtRequest) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    return this.attendancesService.findAll(userId);
  }

  /**
   * Endpoint mendapatkan seluruh data presensi (khusus admin).
   *
   * @param page Halaman data.
   * @param limit Jumlah data per halaman.
   * @returns Daftar seluruh data presensi.
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
   * Endpoint ekspor rekap presensi semua intern ke PDF (khusus admin).
   *
   * @param startDate Tanggal mulai.
   * @param endDate Tanggal akhir.
   * @param institution Nama instansi.
   * @param res Response object untuk mengirim file PDF.
   * @param req Request object yang berisi user.
   * @returns File PDF rekap presensi.
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
    @Request() req: JwtRequest,
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

  /**
   * Endpoint mendapatkan detail presensi berdasarkan ID.
   *
   * @param id ID presensi.
   * @returns Detail data presensi.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail presensi berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(+id);
  }

  /**
   * Endpoint mengajukan permohonan cuti/izin dengan upload bukti.
   *
   * @param req Request object yang berisi user.
   * @param dto Data permohonan cuti/izin.
   * @param file File bukti (opsional).
   * @returns Data permohonan cuti/izin yang diajukan.
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
    @Request() req: JwtRequest,
    @Body() dto: RequestLeaveDto,
    @UploadedFile() file: Express.Multer.File | null,
  ) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    return this.attendancesService.requestLeave(userId, dto, file);
  }

  /**
   * Endpoint validasi permohonan cuti/izin (admin/staff).
   *
   * @param id ID permohonan.
   * @param status Status validasi.
   * @param req Request object yang berisi user.
   * @returns Data permohonan cuti/izin yang telah divalidasi.
   */
  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Validasi permohonan cuti/izin (admin/staff)' })
  async validateLeave(
    @Param('id') id: string,
    @Body('status') status: 'hadir' | 'sakit' | 'izin' | 'tanpa_keterangan',
    @Request() req: JwtRequest,
  ) {
    const adminId = req.user?.userId;
    if (typeof adminId !== 'number') {
      throw new BadRequestException('Admin ID tidak ditemukan');
    }
    return this.attendancesService.validateLeave(+id, status, adminId);
  }

  /**
   * Endpoint ekspor presensi satu intern ke PDF (khusus admin).
   *
   * @param userId ID user intern.
   * @param startDate Tanggal mulai.
   * @param endDate Tanggal akhir.
   * @param res Response object untuk mengirim file PDF.
   * @param req Request object yang berisi user.
   * @returns File PDF presensi intern.
   */
  @Get(':userId/report')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export presensi satu intern ke PDF' })
  async exportUserAttendancePdf(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
    @Request() req: JwtRequest,
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
