import {
  Injectable,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { RequestLeaveDto } from './dto/request-leave.dto';
import { Cron } from '@nestjs/schedule';
import { Prisma, AttendanceStatus } from '@prisma/client';
const PdfPrinter = require('pdfmake');
import { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * Service untuk mengelola presensi (attendance) user.
 */
@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Mengambil latitude kantor dari konfigurasi environment.
   * @throws Error jika tidak dikonfigurasi.
   */
  private get officeLatitude(): number {
    const latitude = this.configService.get<string>('OFFICE_LATITUDE');
    if (!latitude) {
      throw new Error(
        'OFFICE_LATITUDE not configured in environment variables',
      );
    }
    return parseFloat(latitude);
  }

  /**
   * Mengambil longitude kantor dari konfigurasi environment.
   * @throws Error jika tidak dikonfigurasi.
   */
  private get officeLongitude(): number {
    const longitude = this.configService.get<string>('OFFICE_LONGITUDE');
    if (!longitude) {
      throw new Error(
        'OFFICE_LONGITUDE not configured in environment variables',
      );
    }
    return parseFloat(longitude);
  }

  /**
   * Mengambil radius kantor (dalam meter) dari konfigurasi environment.
   * @throws Error jika tidak dikonfigurasi.
   */
  private get allowedRadiusMeters(): number {
    const radius = this.configService.get<string>('OFFICE_RADIUS_METERS');
    if (!radius) {
      throw new Error(
        'OFFICE_RADIUS_METERS not configured in environment variables',
      );
    }
    return parseInt(radius);
  }

  /**
   * Melakukan presensi masuk (clock-in) untuk user.
   * @param userId ID user
   * @param clockInDto Data clock-in (latitude, longitude)
   * @param ip Alamat IP user
   */
  async clockIn(userId: number, clockInDto: ClockInDto, ip: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        clockIn: { gte: today, lt: tomorrow },
      },
    });
    if (existingAttendance) {
      throw new ConflictException(
        'Anda sudah melakukan presensi masuk hari ini.',
      );
    }

    const officeLat = this.officeLatitude;
    const officeLon = this.officeLongitude;
    const officeRadius = this.allowedRadiusMeters;

    if (!officeLat || !officeLon || !officeRadius) {
      throw new InternalServerErrorException(
        'Konfigurasi lokasi kantor tidak ditemukan.',
      );
    }

    const distance = this.calculateDistance(
      clockInDto.latitude,
      clockInDto.longitude,
      officeLat,
      officeLon,
    );

    if (distance > officeRadius) {
      throw new ForbiddenException(
        `Anda harus berada dalam radius ${officeRadius} meter dari kantor. Jarak Anda: ${Math.round(distance)} meter.`,
      );
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        ipAddress: ip,
        latitude: clockInDto.latitude,
        longitude: clockInDto.longitude,
        clockIn: new Date(),
      },
    });
  }

  /**
   * Melakukan presensi pulang (clock-out) untuk user.
   * @param userId ID user
   * @param clockOutDto Data clock-out (latitude, longitude)
   * @param ipAddress Alamat IP user
   */
  async clockOut(userId: number, clockOutDto: ClockOutDto, ipAddress: string) {
    this.validateLocation(clockOutDto.latitude, clockOutDto.longitude);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        clockIn: { gte: today, lt: tomorrow },
        clockOut: null,
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        'Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu.',
      );
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: new Date(),
        clockOutLatitude: clockOutDto.latitude,
        clockOutLongitude: clockOutDto.longitude,
      },
    });
  }

  /**
   * Mengambil seluruh data presensi untuk admin dengan paginasi.
   * @param page Halaman
   * @param limit Jumlah data per halaman
   */
  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        skip,
        take: limit,
        orderBy: { clockIn: 'desc' },
        include: { user: true },
      }),
      this.prisma.attendance.count(),
    ]);
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Mengambil seluruh data presensi milik user tertentu.
   * @param userId ID user
   */
  async findAll(userId: number) {
    const attendances = await this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { clockIn: 'desc' },
    });
    return { data: attendances };
  }

  /**
   * Mengambil satu data presensi berdasarkan ID.
   * @param id ID attendance
   */
  async findOne(id: number) {
    if (!id || typeof id !== 'number' || isNaN(id)) {
      throw new BadRequestException('ID presensi tidak valid');
    }
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!attendance) throw new NotFoundException('Attendance tidak ditemukan');
    return attendance;
  }

  /**
   * Validasi lokasi user saat presensi.
   * @param latitude Latitude user
   * @param longitude Longitude user
   * @throws ForbiddenException jika user di luar radius kantor
   */
  private validateLocation(latitude: number, longitude: number): void {
    const distance = this.calculateDistance(
      latitude,
      longitude,
      this.officeLatitude,
      this.officeLongitude,
    );

    if (distance > this.allowedRadiusMeters) {
      throw new ForbiddenException(
        `Anda harus berada dalam radius ${this.allowedRadiusMeters} meter dari kantor. Jarak Anda: ${Math.round(distance)} meter.`,
      );
    }
  }

  /**
   * Menghitung jarak antara dua koordinat (meter).
   * @param lat1 Latitude 1
   * @param lon1 Longitude 1
   * @param lat2 Latitude 2
   * @param lon2 Longitude 2
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Mengajukan izin/sakit (leave) untuk user.
   * @param userId ID user
   * @param dto Data pengajuan izin
   * @param file File bukti pendukung
   */
  async requestLeave(
    userId: number,
    dto: RequestLeaveDto,
    file: Express.Multer.File | null,
  ) {
    const now = new Date();
    const wibHour = (now.getUTCHours() + 7) % 24;
    if (wibHour >= 11) {
      throw new BadRequestException(
        'Pengajuan hanya bisa dilakukan sebelum pukul 11.00 WIB',
      );
    }

    if (!file) {
      throw new BadRequestException('Bukti pendukung wajib diunggah');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    if (existing) {
      throw new ConflictException('Anda sudah mengajukan presensi hari ini');
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        status: dto.type,
        reasonDescription: dto.description,
        proofFilePath: file.path,
        submittedAt: now,
      },
    });
  }

  /**
   * Memvalidasi pengajuan izin/sakit oleh admin.
   * @param attendanceId ID attendance
   * @param status Status validasi
   * @param adminId ID admin yang memvalidasi
   */
  async validateLeave(
    attendanceId: number,
    status: AttendanceStatus,
    adminId: number,
  ) {
    if (!Object.values(AttendanceStatus).includes(status)) {
      throw new BadRequestException('Status tidak valid');
    }
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status,
        validatedBy: adminId,
        validatedAt: new Date(),
      },
    });
  }

  /**
   * Cron job: Set status tanpa_keterangan untuk user yang tidak presensi/izin sebelum jam 11:00 WIB.
   * Berjalan setiap hari jam 11:01 WIB (WIB = UTC+7, berarti 04:01 UTC).
   */
  @Cron('1 4 * * *')
  async setTanpaKeteranganForAbsentUsers() {
    this.logger.log('Menjalankan update status tanpa_keterangan...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const interns = await this.prisma.user.findMany({
      where: { role: { name: 'intern' } },
      select: { id: true },
    });

    for (const intern of interns) {
      const attendance = await this.prisma.attendance.findFirst({
        where: {
          userId: intern.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      });

      if (!attendance) {
        await this.prisma.attendance.create({
          data: {
            userId: intern.id,
            status: 'tanpa_keterangan',
            reasonDescription:
              'Tidak melakukan presensi atau pengajuan izin/sakit sebelum 11:00 WIB',
            createdAt: new Date(),
          },
        });
        this.logger.log(`Set tanpa_keterangan untuk userId ${intern.id}`);
      }
    }
  }

  async exportAllAttendancesPdf(
    filter: { startDate?: string; endDate?: string; institution?: string },
    adminName: string,
  ): Promise<Buffer> {
    // Query data presensi + user sesuai filter
    const where: any = {};
    if (filter.startDate && filter.endDate) {
      where.clockIn = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate),
      };
    }
    if (filter.institution) {
      where.user = undefined; // remove this line
    }
    const attendances = await this.prisma.attendance.findMany({
      where: {
        ...where,
        user: filter.institution
          ? { asalInstitusi: filter.institution }
          : undefined,
      },
      include: { user: true },
      orderBy: [{ userId: 'asc' }, { clockIn: 'asc' }],
    });

    // Format data untuk tabel PDF
    const tableBody = [
      [
        'No',
        'Nama Intern',
        'Institusi',
        'Tanggal',
        'Status',
        'Clock In',
        'Clock Out',
        'Keterangan',
        'Validator',
      ],
      ...attendances.map((a, i) => [
        i + 1,
        a.user?.name || '-',
        a.user?.asalInstitusi || '-',
        a.clockIn ? new Date(a.clockIn).toLocaleDateString() : '-',
        a.status,
        a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '-',
        a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '-',
        a.reasonDescription || '-',
        a.validatedBy ? String(a.validatedBy) : '-',
      ]),
    ];

    // PDF definition
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Rekap Presensi Semua Intern', style: 'header' },
        {
          text: `Periode: ${filter.startDate || '-'} s/d ${filter.endDate || '-'}`,
        },
        { text: `Institusi: ${filter.institution || 'Semua'}` },
        {
          text: `Dicetak oleh: ${adminName} | Tanggal: ${new Date().toLocaleString()}`,
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: [
              'auto',
              '*',
              '*',
              'auto',
              'auto',
              'auto',
              'auto',
              '*',
              'auto',
            ],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    // pdfmake printer
    const fonts = {
      Helvetica: {
        normal: 'src/assets/fonts/Helvetica-Regular.ttf',
        bold: 'src/assets/fonts/Helvetica-Bold.ttf',
        italics: 'src/assets/fonts/Helvetica-Oblique.ttf',
        bolditalics: 'src/assets/fonts/Helvetica-BoldOblique.ttf',
      },
    };
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  async exportUserAttendancePdf(
    userId: number,
    filter: { startDate?: string; endDate?: string },
    adminName: string,
  ): Promise<Buffer> {
    // Query data presensi user sesuai filter
    const where: any = { userId };
    if (filter.startDate && filter.endDate) {
      where.clockIn = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate),
      };
    }
    const attendances = await this.prisma.attendance.findMany({
      where,
      orderBy: [{ clockIn: 'asc' }],
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Format data untuk tabel PDF
    const tableBody = [
      [
        'No',
        'Tanggal',
        'Status',
        'Clock In',
        'Clock Out',
        'Keterangan',
        'Validator',
      ],
      ...attendances.map((a, i) => [
        i + 1,
        a.clockIn ? new Date(a.clockIn).toLocaleDateString() : '-',
        a.status,
        a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '-',
        a.clockOut ? new Date(a.clockOut).toLocaleTimeString() : '-',
        a.reasonDescription || '-',
        a.validatedBy ? String(a.validatedBy) : '-',
      ]),
    ];

    // PDF definition
    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text: `Rekap Presensi Intern: ${user?.name || '-'}`,
          style: 'header',
        },
        { text: `Institusi: ${user?.asalInstitusi || '-'}` },
        {
          text: `Periode: ${filter.startDate || '-'} s/d ${filter.endDate || '-'}`,
        },
        {
          text: `Dicetak oleh: ${adminName} | Tanggal: ${new Date().toLocaleString()}`,
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto'],
            body: tableBody,
          },
        },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    // pdfmake printer
    const fonts = {
      Helvetica: {
        normal: 'src/assets/fonts/Helvetica-Regular.ttf',
        bold: 'src/assets/fonts/Helvetica-Bold.ttf',
        italics: 'src/assets/fonts/Helvetica-Oblique.ttf',
        bolditalics: 'src/assets/fonts/Helvetica-BoldOblique.ttf',
      },
    };
    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
