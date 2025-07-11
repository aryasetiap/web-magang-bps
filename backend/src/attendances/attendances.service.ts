import {
  Injectable,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException, // 1. Tambahkan NotFoundException ke daftar import
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';

// Helper function untuk menghitung jarak (tidak ada perubahan di sini)
function getDistanceInMeters(
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

@Injectable()
export class AttendancesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async clockIn(userId: number, clockInDto: ClockInDto, ip: string) {
    // --- Validasi 1: Cek apakah user sudah clock-in hari ini (tidak ada perubahan) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId: userId,
        clockIn: { gte: today, lt: tomorrow },
      },
    });
    if (existingAttendance) {
      throw new ConflictException(
        'Anda sudah melakukan presensi masuk hari ini.',
      );
    }

    // --- Validasi 2: Cek lokasi user (dengan perbaikan) ---
    const officeLat = this.configService.get<number>('OFFICE_LATITUDE');
    const officeLon = this.configService.get<number>('OFFICE_LONGITUDE');
    const officeRadius = this.configService.get<number>('OFFICE_RADIUS_METERS');

    // [PERBAIKAN] Cek apakah konfigurasi ada sebelum digunakan
    if (!officeLat || !officeLon || !officeRadius) {
      throw new InternalServerErrorException(
        'Konfigurasi lokasi kantor tidak ditemukan.',
      );
    }

    const distance = getDistanceInMeters(
      clockInDto.latitude,
      clockInDto.longitude,
      officeLat,
      officeLon,
    );

    if (distance > officeRadius) {
      throw new ForbiddenException(
        `Anda harus berada dalam radius ${officeRadius} meter dari kantor. Jarak Anda: ${Math.round(
          distance,
        )} meter.`,
      );
    }

    // --- Simpan data presensi (dengan perbaikan) ---
    return this.prisma.attendance.create({
      data: {
        userId: userId,
        ipAddress: ip,
        latitude: clockInDto.latitude,
        longitude: clockInDto.longitude,
        clockIn: new Date(), // [PERBAIKAN] Tambahkan field clockIn yang wajib diisi
      },
    });
  }

  // 2. Tambahkan method baru ini
  async clockOut(userId: number) {
    // --- Cari data presensi masuk hari ini ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set waktu ke awal hari

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set waktu ke awal hari berikutnya

    const attendanceToUpdate = await this.prisma.attendance.findFirst({
      where: {
        userId: userId,
        clockIn: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // --- Validasi ---
    if (!attendanceToUpdate) {
      throw new NotFoundException(
        'Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu.',
      );
    }

    if (attendanceToUpdate.clockOut) {
      throw new ConflictException(
        'Anda sudah melakukan presensi pulang hari ini.',
      );
    }

    // --- Jika valid, update record dengan waktu clock-out ---
    return this.prisma.attendance.update({
      where: {
        id: attendanceToUpdate.id, // Update berdasarkan ID unik presensi
      },
      data: {
        clockOut: new Date(),
      },
    });
  }

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

  // Kita tambahkan kembali method lain sebagai placeholder agar controller tidak error
  findAll(userId: number) {
    return `This action returns all attendances for user #${userId}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendance`;
  }
}
