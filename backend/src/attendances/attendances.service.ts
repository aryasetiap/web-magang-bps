/**
 * Modul AttendancesService
 * -----------------------------------------
 * Berisi service untuk mengelola presensi (attendance) user, termasuk clock-in, clock-out,
 * pengajuan izin/sakit, validasi admin, rekap PDF, dan cron job status tanpa_keterangan.
 */

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
// eslint-disable-next-line @typescript-eslint/no-require-imports
import PdfPrinter = require('pdfmake');
import type {
  TDocumentDefinitions,
  Content,
  TFontDictionary,
  TableCell, // Tambahkan import TableCell
} from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service AttendancesService
 * -------------------------
 * Mengelola seluruh proses presensi, izin, rekap, dan validasi presensi user.
 */
@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Mengambil latitude kantor dari konfigurasi environment.
   * @returns {number} Latitude kantor
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
   * @returns {number} Longitude kantor
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
   * Mengambil radius kantor (meter) dari konfigurasi environment.
   * @returns {number} Radius kantor dalam meter
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
   * @returns Data presensi yang berhasil dicatat
   * @throws ConflictException jika sudah presensi hari ini
   * @throws ForbiddenException jika di luar radius kantor
   * @throws InternalServerErrorException jika konfigurasi lokasi tidak ditemukan
   */
  async clockIn(userId: number, clockInDto: ClockInDto, ip: string) {
    const { today, tomorrow } = this.getTodayAndTomorrow();

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
        status: 'hadir',
      },
    });
  }

  /**
   * Melakukan presensi pulang (clock-out) untuk user.
   * @param userId ID user
   * @param clockOutDto Data clock-out (latitude, longitude)
   * @returns Data presensi yang berhasil diupdate
   * @throws NotFoundException jika belum clock-in hari ini
   * @throws ForbiddenException jika di luar radius kantor
   */
  async clockOut(userId: number, clockOutDto: ClockOutDto) {
    this.validateLocation(clockOutDto.latitude, clockOutDto.longitude);

    const { today, tomorrow } = this.getTodayAndTomorrow();

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
   * @param page Halaman (default: 1)
   * @param limit Jumlah data per halaman (default: 20)
   * @returns Data presensi dan meta paginasi
   */
  async findAllForAdmin(page = 1, limit = 20) {
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
   * @returns Daftar presensi user
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
   * @returns Data presensi
   * @throws BadRequestException jika ID tidak valid
   * @throws NotFoundException jika data tidak ditemukan
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
   * @returns Jarak dalam meter
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
   * @returns Data pengajuan izin yang berhasil dicatat
   * @throws BadRequestException jika lewat jam 11:00 WIB atau file tidak diunggah
   * @throws ConflictException jika sudah mengajukan presensi hari ini
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

    const { today, tomorrow } = this.getTodayAndTomorrow();

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
   * @returns Data presensi yang sudah divalidasi
   * @throws BadRequestException jika status tidak valid
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
   * Berjalan setiap hari jam 16:31 WIB.
   * @returns void
   */
  @Cron('31 9 * * *')
  async setTanpaKeteranganForAbsentUsers(): Promise<void> {
    this.logger.log(
      'Menjalankan update status tanpa_keterangan jam 16:31 WIB...',
    );
    const { today, tomorrow } = this.getTodayAndTomorrow();

    // Ambil semua intern yang sedang magang hari ini
    const interns = await this.prisma.user.findMany({
      where: {
        role: { name: 'intern' },
        internshipApplications: {
          some: {
            startDate: { lte: today },
            endDate: { gte: today },
            status: 'diterima',
          },
        },
      },
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
              'Tidak melakukan presensi atau pengajuan izin/sakit sebelum 16:30 WIB',
            createdAt: new Date(),
          },
        });
        this.logger.log(`Set tanpa_keterangan untuk userId ${intern.id}`);
      }
    }
  }

  /**
   * Export rekap presensi semua intern ke PDF.
   * @param filter Filter tanggal dan institusi
   * @param adminName Nama admin pencetak
   * @returns Buffer PDF
   */
  async exportAllAttendancesPdf(
    filter: { startDate?: string; endDate?: string; institution?: string },
    adminName: string,
  ): Promise<Buffer> {
    const where: Prisma.AttendanceWhereInput = {};
    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      where.OR = [
        { clockIn: { gte: start, lte: end } },
        { submittedAt: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ];
    }

    const attendances = await this.prisma.attendance.findMany({
      where: {
        ...where,
        user: filter.institution
          ? { asalInstitusi: filter.institution }
          : undefined,
      },
      include: { user: true },
      orderBy: [{ user: { name: 'asc' } }, { clockIn: 'asc' }],
    });

    const headerImageBase64 = this.getHeaderImageBase64();

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
      ],
      ...attendances.map((a, i) => [
        i + 1,
        a.user?.name || '-',
        a.user?.asalInstitusi || '-',
        this.formatAttendanceDate(a),
        a.status,
        a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID') : '-',
        a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID') : '-',
        a.reasonDescription || '-',
      ]),
    ];

    const statusTableBody: TableCell[][] = this.buildStatusSummaryTable(
      attendances as { status: string }[],
    );

    const content: Content[] = [
      { text: 'Rekap Presensi Semua Intern', style: 'header' },
      {
        text: `Periode: ${filter.startDate || '-'} s/d ${filter.endDate || '-'}`,
      },
      { text: `Institusi: ${filter.institution || 'Semua'}` },
      {
        text: `Dicetak oleh: ${adminName} | Tanggal: ${new Date().toLocaleString('id-ID')}`,
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 32],
      },
      {
        text: 'Rekapitulasi Status Presensi:',
        style: { bold: true, margin: [0, 20, 0, 4] },
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: statusTableBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 0],
      },
    ];

    const docDefinition: TDocumentDefinitions = {
      header: (currentPage, pageCount, pageSize) => {
        // pdfmake passes pageSize as { width: number, height: number }
        return this.buildPdfHeader(
          headerImageBase64,
          pageSize as { width: number; height: number },
        );
      },
      content,
      pageMargins: [40, 120, 40, 60],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'center',
        },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    return this.generatePdf(docDefinition);
  }

  /**
   * Export rekap presensi satu user ke PDF.
   * @param userId ID user
   * @param filter Filter tanggal
   * @param adminName Nama admin pencetak
   * @returns Buffer PDF
   */
  async exportUserAttendancePdf(
    userId: number,
    filter: { startDate?: string; endDate?: string },
    adminName: string,
  ): Promise<Buffer> {
    const where: Prisma.AttendanceWhereInput = { userId };
    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);
      where.OR = [
        { clockIn: { gte: start, lte: end } },
        { submittedAt: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ];
    }
    const attendances = await this.prisma.attendance.findMany({
      where,
      orderBy: [{ clockIn: 'asc' }],
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const headerImageBase64 = this.getHeaderImageBase64();

    const tableBody = [
      ['No', 'Tanggal', 'Status', 'Clock In', 'Clock Out', 'Keterangan'],
      ...attendances.map((a, i) => [
        i + 1,
        this.formatAttendanceDate(a),
        a.status,
        a.clockIn ? new Date(a.clockIn).toLocaleTimeString('id-ID') : '-',
        a.clockOut ? new Date(a.clockOut).toLocaleTimeString('id-ID') : '-',
        a.reasonDescription || '-',
      ]),
    ];

    const statusTableBody: TableCell[][] = this.buildStatusSummaryTable(
      attendances as { status: string }[],
    );

    const content: Content[] = [
      {
        text: `Rekap Presensi Intern: ${user?.name || '-'}`,
        style: 'header',
      },
      { text: `Institusi: ${user?.asalInstitusi || '-'}`, alignment: 'center' },
      {
        text: `Periode: ${filter.startDate || '-'} s/d ${filter.endDate || '-'}`,
        alignment: 'center',
      },
      {
        text: `Dicetak oleh: ${adminName} | Tanggal: ${new Date().toLocaleString('id-ID')}`,
        margin: [0, 0, 0, 20],
        alignment: 'center',
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 32],
      },
      {
        text: 'Rekapitulasi Status Presensi:',
        style: { bold: true, margin: [0, 20, 0, 4] },
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: statusTableBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 0],
      },
    ];

    const docDefinition: TDocumentDefinitions = {
      header: (currentPage, pageCount, pageSize) =>
        this.buildPdfHeader(headerImageBase64, pageSize),
      content,
      pageMargins: [40, 120, 40, 60],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'center',
        },
      },
      defaultStyle: { font: 'Helvetica' },
    };

    return this.generatePdf(docDefinition);
  }

  /**
   * Mendapatkan tanggal hari ini dan besok (pukul 00:00).
   * @returns { today: Date, tomorrow: Date }
   */
  private getTodayAndTomorrow(): { today: Date; tomorrow: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { today, tomorrow };
  }

  /**
   * Membaca dan mengubah header image ke base64.
   * @returns string|null base64 image
   */
  private getHeaderImageBase64(): string | null {
    const headerImagePath = path.resolve(
      process.cwd(),
      'src/assets/header_report/header_report.png',
    );
    return fs.existsSync(headerImagePath)
      ? fs.readFileSync(headerImagePath).toString('base64')
      : null;
  }

  /**
   * Membuat header dokumen PDF.
   * @param headerImageBase64 base64 image
   * @param pageSize Ukuran halaman PDF
   * @returns Content|null
   */
  private buildPdfHeader(
    headerImageBase64: string | null,
    pageSize: { width: number; height: number },
  ): Content | null {
    if (headerImageBase64) {
      // Ensure fit is always a tuple of exactly two numbers
      const fit: [number, number] = [
        typeof pageSize.width === 'number' ? pageSize.width - 80 : 500,
        80,
      ];
      return {
        image: `data:image/png;base64,${headerImageBase64}`,
        fit,
        alignment: 'center',
        margin: [0, 20, 0, 10],
      };
    }
    return null;
  }

  /**
   * Membuat tabel rekap status presensi.
   * @param attendances Daftar presensi
   * @returns Array body tabel status
   */
  private buildStatusSummaryTable(
    attendances: { status: string }[],
  ): TableCell[][] {
    const statusSummary: Record<string, number> = {};
    for (const a of attendances) {
      statusSummary[a.status] = (statusSummary[a.status] || 0) + 1;
    }
    return [
      ['Status', 'Jumlah'],
      ...Object.entries(statusSummary).map(([status, count]) => [
        status,
        count,
      ]),
    ];
  }

  /**
   * Format tanggal presensi (clockIn, submittedAt, createdAt).
   * @param attendance Data presensi
   * @returns string tanggal
   */
  private formatAttendanceDate(attendance: {
    clockIn?: Date | string | null;
    submittedAt?: Date | string | null;
    createdAt?: Date | string | null;
  }): string {
    if (attendance.clockIn) {
      return new Date(attendance.clockIn).toLocaleDateString('id-ID');
    }
    if (attendance.submittedAt) {
      return new Date(attendance.submittedAt).toLocaleDateString('id-ID');
    }
    if (attendance.createdAt) {
      return new Date(attendance.createdAt).toLocaleDateString('id-ID');
    }
    return '-';
  }

  /**
   * Generate dokumen PDF dari docDefinition.
   * @param docDefinition Definisi dokumen PDF
   * @returns Buffer PDF
   */
  private async generatePdf(
    docDefinition: TDocumentDefinitions,
  ): Promise<Buffer> {
    const fonts: TFontDictionary = {
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
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
