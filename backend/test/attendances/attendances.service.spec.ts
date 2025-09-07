/**
 * Unit test AttendancesService
 * --------------------------------
 * Pengujian seluruh fitur utama AttendancesService, termasuk presensi masuk/keluar,
 * pengajuan izin/sakit, validasi, export PDF, dan penandaan tanpa keterangan.
 * Setiap pengujian didokumentasikan dengan docstring berbahasa Indonesia.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from '../../src/attendances/attendances.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AttendanceStatus } from '@prisma/client';
import {
  RequestLeaveDto,
  LeaveType,
} from '../../src/attendances/dto/request-leave.dto';
import { ClockInDto } from '../../src/attendances/dto/clock-in.dto';
import { ClockOutDto } from '../../src/attendances/dto/clock-out.dto';
import MockDate from 'mockdate';
import * as fs from 'fs';

// Konstanta untuk pengujian lokasi kantor dan user
const OFFICE_LATITUDE = '-5.235';
const OFFICE_LONGITUDE = '105.1572';
const OFFICE_RADIUS_METERS = '50';
const VALID_LATITUDE = -5.235;
const VALID_LONGITUDE = 105.1572;
const INVALID_LATITUDE = 0;
const INVALID_LONGITUDE = 0;
const USER_ID = 1;
const ADMIN_ID = 99;
const ADMIN_NAME = 'Admin';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let prismaMock: any;
  let configMock: any;

  /**
   * Setup dan teardown untuk setiap pengujian.
   * Membuat mock PrismaService dan ConfigService.
   */
  beforeEach(async () => {
    prismaMock = {
      attendance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    configMock = {
      get: jest.fn((key: string) => {
        if (key === 'OFFICE_LATITUDE') return OFFICE_LATITUDE;
        if (key === 'OFFICE_LONGITUDE') return OFFICE_LONGITUDE;
        if (key === 'OFFICE_RADIUS_METERS') return OFFICE_RADIUS_METERS;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
  });

  afterEach(() => {
    MockDate.reset();
    jest.restoreAllMocks();
  });

  /**
   * Pengujian fitur presensi masuk (clockIn)
   */
  describe('clockIn', () => {
    /**
     * Berhasil clock-in jika user belum presensi hari ini dan lokasi valid.
     */
    it('berhasil clock-in jika belum presensi hari ini dan lokasi valid', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue(null);
      prismaMock.attendance.create.mockResolvedValue({
        id: 1,
        status: 'hadir',
      });

      const dto: ClockInDto = {
        latitude: VALID_LATITUDE,
        longitude: VALID_LONGITUDE,
      };
      const result = await service.clockIn(USER_ID, dto, '127.0.0.1');
      expect(result).toHaveProperty('id', 1);
      expect(prismaMock.attendance.create).toBeCalled();
    });

    /**
     * Gagal clock-in jika user sudah presensi hari ini.
     */
    it('gagal clock-in jika sudah presensi hari ini', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue({ id: 1 });
      const dto: ClockInDto = {
        latitude: VALID_LATITUDE,
        longitude: VALID_LONGITUDE,
      };
      await expect(service.clockIn(USER_ID, dto, '127.0.0.1')).rejects.toThrow(
        'Anda sudah melakukan presensi masuk hari ini.',
      );
    });

    /**
     * Gagal clock-in jika lokasi kantor tidak dikonfigurasi di environment.
     */
    it('gagal clock-in jika lokasi kantor tidak dikonfigurasi', async () => {
      configMock.get = jest.fn((key: string) => {
        if (key === 'OFFICE_LATITUDE') return undefined;
        if (key === 'OFFICE_LONGITUDE') return OFFICE_LONGITUDE;
        if (key === 'OFFICE_RADIUS_METERS') return OFFICE_RADIUS_METERS;
        return undefined;
      });
      prismaMock.attendance.findFirst.mockResolvedValue(null);
      const dto: ClockInDto = {
        latitude: VALID_LATITUDE,
        longitude: VALID_LONGITUDE,
      };
      await expect(service.clockIn(USER_ID, dto, '127.0.0.1')).rejects.toThrow(
        'OFFICE_LATITUDE not configured in environment variables',
      );
    });

    /**
     * Gagal clock-in jika lokasi user di luar radius kantor.
     */
    it('gagal clock-in jika lokasi user di luar radius kantor', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue(null);
      const dto: ClockInDto = {
        latitude: INVALID_LATITUDE,
        longitude: INVALID_LONGITUDE,
      };
      await expect(service.clockIn(USER_ID, dto, '127.0.0.1')).rejects.toThrow(
        /Anda harus berada dalam radius/,
      );
    });
  });

  /**
   * Pengujian fitur presensi keluar (clockOut)
   */
  describe('clockOut', () => {
    /**
     * Berhasil clock-out jika user sudah presensi masuk hari ini dan lokasi valid.
     */
    it('berhasil clock-out jika ada presensi masuk hari ini dan lokasi valid', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.attendance.update.mockResolvedValue({
        id: 1,
        clockOut: new Date(),
      });

      const dto: ClockOutDto = {
        latitude: VALID_LATITUDE,
        longitude: VALID_LONGITUDE,
      };
      const result = await service.clockOut(USER_ID, dto);
      expect(result).toHaveProperty('id', 1);
      expect(prismaMock.attendance.update).toBeCalled();
    });

    /**
     * Gagal clock-out jika user belum presensi masuk hari ini.
     */
    it('gagal clock-out jika tidak ada presensi masuk hari ini', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue(null);
      const dto: ClockOutDto = {
        latitude: VALID_LATITUDE,
        longitude: VALID_LONGITUDE,
      };
      await expect(service.clockOut(USER_ID, dto)).rejects.toThrow(
        'Tidak ditemukan data presensi masuk untuk hari ini. Silakan clock-in terlebih dahulu.',
      );
    });

    /**
     * Gagal clock-out jika lokasi user di luar radius kantor.
     */
    it('gagal clock-out jika lokasi user di luar radius kantor', async () => {
      prismaMock.attendance.findFirst.mockResolvedValue({ id: 1 });
      const dto: ClockOutDto = {
        latitude: INVALID_LATITUDE,
        longitude: INVALID_LONGITUDE,
      };
      await expect(service.clockOut(USER_ID, dto)).rejects.toThrow(
        /Anda harus berada dalam radius/,
      );
    });
  });

  /**
   * Pengujian fitur admin: mengambil seluruh data presensi dengan paginasi.
   */
  describe('findAllForAdmin', () => {
    /**
     * Mengembalikan data presensi dengan paginasi.
     */
    it('mengembalikan data presensi dengan paginasi', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([{ id: 1 }]);
      prismaMock.attendance.count.mockResolvedValue(1);
      const result = await service.findAllForAdmin(1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('lastPage', 1);
    });
  });

  /**
   * Pengujian fitur user: mengambil seluruh presensi milik user.
   */
  describe('findAll', () => {
    /**
     * Mengembalikan seluruh presensi milik user.
     */
    it('mengembalikan seluruh presensi milik user', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll(USER_ID);
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  /**
   * Pengujian fitur detail presensi (findOne)
   */
  describe('findOne', () => {
    /**
     * Mengembalikan detail presensi jika ditemukan.
     */
    it('mengembalikan detail presensi jika ditemukan', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({ id: 1 });
      const result = await service.findOne(1);
      expect(result).toHaveProperty('id', 1);
    });

    /**
     * Gagal jika id presensi tidak valid.
     */
    it('gagal jika id tidak valid', async () => {
      await expect(service.findOne(NaN)).rejects.toThrow(
        'ID presensi tidak valid',
      );
    });

    /**
     * Gagal jika presensi tidak ditemukan.
     */
    it('gagal jika presensi tidak ditemukan', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(
        'Attendance tidak ditemukan',
      );
    });
  });

  /**
   * Pengujian fitur pengajuan izin/sakit (requestLeave)
   */
  describe('requestLeave', () => {
    /**
     * Gagal jika pengajuan dilakukan setelah jam 11:00 WIB.
     */
    it('gagal jika pengajuan dilakukan setelah jam 11:00 WIB', async () => {
      MockDate.set('2025-07-18T04:30:00Z'); // 11:30 WIB
      await expect(
        service.requestLeave(
          USER_ID,
          { type: LeaveType.izin, description: 'Alasan' },
          { path: 'file.pdf' } as any,
        ),
      ).rejects.toThrow(
        'Pengajuan hanya bisa dilakukan sebelum pukul 11.00 WIB',
      );
    });

    /**
     * Gagal jika file bukti tidak diunggah.
     */
    it('gagal jika file bukti tidak diunggah', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      await expect(
        service.requestLeave(
          USER_ID,
          { type: LeaveType.izin, description: 'Alasan' },
          null,
        ),
      ).rejects.toThrow('Bukti pendukung wajib diunggah');
    });

    /**
     * Gagal jika sudah mengajukan presensi hari ini.
     */
    it('gagal jika sudah mengajukan presensi hari ini', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      prismaMock.attendance.findFirst.mockResolvedValueOnce({ id: 1 });
      await expect(
        service.requestLeave(
          USER_ID,
          { type: LeaveType.izin, description: 'Alasan' },
          { path: 'file.pdf' } as any,
        ),
      ).rejects.toThrow('Anda sudah mengajukan presensi hari ini');
    });

    /**
     * Berhasil mengajukan izin/sakit jika semua syarat terpenuhi.
     */
    it('berhasil mengajukan izin/sakit', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      prismaMock.attendance.findFirst.mockResolvedValueOnce(null);
      prismaMock.attendance.create.mockResolvedValueOnce({
        id: 2,
        status: AttendanceStatus.izin,
      });
      const result = await service.requestLeave(
        USER_ID,
        { type: LeaveType.izin, description: 'Alasan' },
        { path: 'file.pdf' } as any,
      );
      expect(result).toHaveProperty('id', 2);
      expect(result).toHaveProperty('status', AttendanceStatus.izin);
    });
  });

  /**
   * Pengujian fitur validasi pengajuan izin/sakit (validateLeave)
   */
  describe('validateLeave', () => {
    /**
     * Gagal jika status validasi tidak sesuai enum AttendanceStatus.
     */
    it('gagal jika status tidak valid', async () => {
      await expect(
        service.validateLeave(USER_ID, 'invalid' as any, ADMIN_ID),
      ).rejects.toThrow('Status tidak valid');
    });

    /**
     * Berhasil update status presensi setelah validasi.
     */
    it('berhasil update status presensi', async () => {
      prismaMock.attendance.update.mockResolvedValueOnce({
        id: 1,
        status: AttendanceStatus.sakit,
      });
      const result = await service.validateLeave(
        USER_ID,
        AttendanceStatus.sakit,
        ADMIN_ID,
      );
      expect(result).toHaveProperty('status', AttendanceStatus.sakit);
    });
  });

  /**
   * Pengujian fitur export PDF presensi (exportAllAttendancesPdf & exportUserAttendancePdf)
   */
  describe('exportAllAttendancesPdf & exportUserAttendancePdf', () => {
    /**
     * Setup mock file system dan PDF generator.
     */
    beforeEach(() => {
      const originalReadFileSync = fs.readFileSync;
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'readFileSync').mockImplementation((path, options) => {
        if (path.toString().endsWith('.ttf')) {
          return originalReadFileSync(path, options);
        }
        return Buffer.from('');
      });
    });

    /**
     * Menghasilkan Buffer PDF untuk seluruh presensi (admin).
     */
    it('menghasilkan Buffer PDF untuk semua presensi', async () => {
      prismaMock.attendance.findMany.mockResolvedValueOnce([
        {
          user: { name: 'Budi', asalInstitusi: 'ITS' },
          clockIn: new Date('2025-07-01T08:00:00Z'),
          clockOut: new Date('2025-07-01T16:00:00Z'),
          status: 'hadir',
          reasonDescription: '',
          validatedBy: ADMIN_ID,
        },
      ]);
      prismaMock.attendance.count.mockResolvedValueOnce(1);
      const buffer = await service.exportAllAttendancesPdf(
        { startDate: '2025-07-01', endDate: '2025-07-31', institution: 'ITS' },
        ADMIN_NAME,
      );
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    /**
     * Menghasilkan Buffer PDF untuk presensi user tertentu.
     */
    it('menghasilkan Buffer PDF untuk presensi user tertentu', async () => {
      prismaMock.attendance.findMany.mockResolvedValueOnce([
        {
          clockIn: new Date('2025-07-01T08:00:00Z'),
          clockOut: new Date('2025-07-01T16:00:00Z'),
          status: 'hadir',
          reasonDescription: '',
          validatedBy: ADMIN_ID,
        },
      ]);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        name: 'Budi',
        asalInstitusi: 'ITS',
      });
      const buffer = await service.exportUserAttendancePdf(
        123,
        { startDate: '2025-07-01', endDate: '2025-07-31' },
        ADMIN_NAME,
      );
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  /**
   * Pengujian fitur cron job: menandai user yang tidak presensi/izin sebagai tanpa_keterangan.
   */
  describe('setTanpaKeteranganForAbsentUsers', () => {
    /**
     * Menandai user yang tidak presensi/izin hari ini sebagai tanpa_keterangan.
     */
    it('menandai user yang tidak presensi/izin sebagai tanpa_keterangan', async () => {
      prismaMock.user.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      prismaMock.attendance.findFirst
        .mockResolvedValueOnce(null) // user 1
        .mockResolvedValueOnce({ id: 2 }); // user 2
      prismaMock.attendance.create.mockResolvedValue({
        id: 10,
        status: 'tanpa_keterangan',
      });

      await expect(
        service.setTanpaKeteranganForAbsentUsers(),
      ).resolves.not.toThrow();
      expect(prismaMock.attendance.create).toBeCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            status: 'tanpa_keterangan',
          }),
        }),
      );
    });
  });
});
