/**
 * Unit test AttendancesController
 * --------------------------------
 * File ini berisi pengujian unit untuk AttendancesController pada aplikasi presensi.
 * Seluruh method pada AttendancesService dimock, dan setiap endpoint utama diuji
 * untuk memastikan perilaku yang diharapkan, baik pada kasus sukses maupun gagal.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesController } from '../../src/attendances/attendances.controller';
import { AttendancesService } from '../../src/attendances/attendances.service';
import { BadRequestException } from '@nestjs/common';
import { LeaveType } from '../../src/attendances/dto/request-leave.dto';

// Konstanta untuk data dummy yang sering digunakan
const MOCK_USER_ID = 1;
const MOCK_ADMIN_ID = 99;
const MOCK_LATITUDE = -5.235;
const MOCK_LONGITUDE = 105.1572;
const MOCK_IP = '127.0.0.1';
const MOCK_NAME = 'Admin';
const MOCK_START_DATE = '2025-07-01';
const MOCK_END_DATE = '2025-07-31';
const MOCK_INSTITUTION = 'ITS';
const MOCK_PDF_BUFFER = Buffer.from('PDFDATA');
const MOCK_FILE = { path: 'file.pdf' };

describe('AttendancesController', () => {
  /**
   * Deklarasi variabel controller dan service mock.
   */
  let controller: AttendancesController;
  let service: Record<string, jest.Mock>;

  /**
   * Setup sebelum setiap test dijalankan.
   * Membuat mock AttendancesService dan inisialisasi controller.
   */
  beforeEach(async () => {
    service = {
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      findAll: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      requestLeave: jest.fn(),
      validateLeave: jest.fn(),
      exportAllAttendancesPdf: jest.fn(),
      exportUserAttendancePdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [{ provide: AttendancesService, useValue: service }],
    }).compile();

    controller = module.get<AttendancesController>(AttendancesController);
  });

  /**
   * Pengujian endpoint clockIn
   * Menguji proses presensi masuk (clock-in) oleh user.
   */
  describe('clockIn', () => {
    /**
     * Menguji clock-in berhasil ketika userId valid dan service tidak error.
     */
    it('berhasil clock-in jika userId valid', async () => {
      service.clockIn.mockResolvedValue({ id: 1 });
      const req = { user: { userId: MOCK_USER_ID } };
      const dto = { latitude: MOCK_LATITUDE, longitude: MOCK_LONGITUDE };

      const result = await controller.clockIn(req as any, dto, MOCK_IP);

      expect(result).toEqual({ id: 1 });
      expect(service.clockIn).toBeCalledWith(MOCK_USER_ID, dto, MOCK_IP);
    });

    /**
     * Menguji clock-in gagal jika userId tidak tersedia pada request.
     */
    it('gagal clock-in jika userId tidak ada', async () => {
      const req = { user: {} };

      await expect(
        controller.clockIn(req as any, { latitude: 1, longitude: 1 }, MOCK_IP),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji clock-in gagal jika terjadi error pada service.
     */
    it('gagal clock-in jika service error', async () => {
      service.clockIn.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_USER_ID } };

      await expect(
        controller.clockIn(req as any, { latitude: 1, longitude: 1 }, MOCK_IP),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint clockOut
   * Menguji proses presensi pulang (clock-out) oleh user.
   */
  describe('clockOut', () => {
    /**
     * Menguji clock-out berhasil ketika userId valid dan service tidak error.
     */
    it('berhasil clock-out jika userId valid', async () => {
      service.clockOut.mockResolvedValue({
        id: 1,
        clockOutLatitude: MOCK_LATITUDE,
        clockOutLongitude: MOCK_LONGITUDE,
      });
      const req = { user: { userId: MOCK_USER_ID } };
      const dto = { latitude: MOCK_LATITUDE, longitude: MOCK_LONGITUDE };

      const result = await controller.clockOut(dto, req as any);

      expect(result).toHaveProperty('message', 'Presensi pulang berhasil');
      expect(result.attendance.clockOutCoordinates).toEqual({
        latitude: MOCK_LATITUDE,
        longitude: MOCK_LONGITUDE,
      });
      expect(service.clockOut).toBeCalledWith(MOCK_USER_ID, dto);
    });

    /**
     * Menguji clock-out gagal jika userId tidak tersedia pada request.
     */
    it('gagal clock-out jika userId tidak ada', async () => {
      const req = { user: {} };

      await expect(
        controller.clockOut({ latitude: 1, longitude: 1 }, req as any),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji clock-out gagal jika terjadi error pada service.
     */
    it('gagal clock-out jika service error', async () => {
      service.clockOut.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_USER_ID } };

      await expect(
        controller.clockOut({ latitude: 1, longitude: 1 }, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findAll
   * Menguji pengambilan riwayat presensi user sendiri.
   */
  describe('findAll', () => {
    /**
     * Menguji pengambilan riwayat presensi berhasil jika userId valid.
     */
    it('berhasil mengambil riwayat presensi jika userId valid', async () => {
      service.findAll.mockResolvedValue({ data: [{ id: 1 }] });
      const req = { user: { userId: MOCK_USER_ID } };

      const result = await controller.findAll(req as any);

      expect(result).toEqual({ data: [{ id: 1 }] });
      expect(service.findAll).toBeCalledWith(MOCK_USER_ID);
    });

    /**
     * Menguji pengambilan riwayat presensi gagal jika userId tidak ada.
     */
    it('gagal mengambil riwayat presensi jika userId tidak ada', async () => {
      const req = { user: {} };

      await expect(controller.findAll(req as any)).rejects.toThrow(
        'User ID tidak ditemukan',
      );
    });

    /**
     * Menguji pengambilan riwayat presensi gagal jika terjadi error pada service.
     */
    it('gagal mengambil riwayat presensi jika service error', async () => {
      service.findAll.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_USER_ID } };

      await expect(controller.findAll(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint getAllAttendances
   * Menguji pengambilan seluruh data presensi oleh admin.
   */
  describe('getAllAttendances', () => {
    /**
     * Menguji pengambilan seluruh data presensi berhasil.
     */
    it('berhasil mengambil seluruh data presensi', async () => {
      service.findAllForAdmin.mockResolvedValue({ data: [{ id: 1 }] });

      const result = await controller.getAllAttendances(1, 10);

      expect(result).toEqual({ data: [{ id: 1 }] });
      expect(service.findAllForAdmin).toBeCalledWith(1, 10);
    });

    /**
     * Menguji pengambilan seluruh data presensi gagal jika terjadi error pada service.
     */
    it('gagal mengambil seluruh data presensi jika service error', async () => {
      service.findAllForAdmin.mockRejectedValue(new Error('error'));

      await expect(controller.getAllAttendances(1, 10)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint exportAllAttendancesPdf
   * Menguji proses ekspor seluruh presensi ke PDF oleh admin.
   */
  describe('exportAllAttendancesPdf', () => {
    /**
     * Menguji ekspor PDF berhasil.
     */
    it('berhasil ekspor PDF seluruh presensi', async () => {
      service.exportAllAttendancesPdf.mockResolvedValue(MOCK_PDF_BUFFER);
      const req = { user: { name: MOCK_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };

      await controller.exportAllAttendancesPdf(
        MOCK_START_DATE,
        MOCK_END_DATE,
        MOCK_INSTITUTION,
        res as any,
        req as any,
      );

      expect(service.exportAllAttendancesPdf).toBeCalledWith(
        {
          startDate: MOCK_START_DATE,
          endDate: MOCK_END_DATE,
          institution: MOCK_INSTITUTION,
        },
        MOCK_NAME,
      );
      expect(res.set).toBeCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rekap-presensi.pdf"`,
      });
      expect(res.end).toBeCalledWith(MOCK_PDF_BUFFER);
    });

    /**
     * Menguji ekspor PDF gagal jika terjadi error pada service.
     */
    it('gagal ekspor PDF jika service error', async () => {
      service.exportAllAttendancesPdf.mockRejectedValue(new Error('error'));
      const req = { user: { name: MOCK_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };

      await expect(
        controller.exportAllAttendancesPdf(
          MOCK_START_DATE,
          MOCK_END_DATE,
          MOCK_INSTITUTION,
          res as any,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findOne
   * Menguji pengambilan detail presensi berdasarkan ID.
   */
  describe('findOne', () => {
    /**
     * Menguji pengambilan detail presensi berhasil.
     */
    it('berhasil mengambil detail presensi', async () => {
      service.findOne.mockResolvedValue({ id: 1 });

      const result = await controller.findOne('1');

      expect(result).toEqual({ id: 1 });
      expect(service.findOne).toBeCalledWith(1);
    });

    /**
     * Menguji pengambilan detail presensi gagal jika terjadi error pada service.
     */
    it('gagal mengambil detail presensi jika service error', async () => {
      service.findOne.mockRejectedValue(new Error('error'));

      await expect(controller.findOne('1')).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint requestLeave
   * Menguji proses pengajuan cuti/izin oleh user.
   */
  describe('requestLeave', () => {
    /**
     * Menguji pengajuan cuti/izin berhasil jika userId valid.
     */
    it('berhasil mengajukan cuti/izin jika userId valid', async () => {
      service.requestLeave.mockResolvedValue({ id: 2 });
      const req = { user: { userId: MOCK_USER_ID } };
      const dto = { type: LeaveType.izin, description: 'Alasan' };

      const result = await controller.requestLeave(
        req as any,
        dto,
        MOCK_FILE as any,
      );

      expect(result).toEqual({ id: 2 });
      expect(service.requestLeave).toBeCalledWith(MOCK_USER_ID, dto, MOCK_FILE);
    });

    /**
     * Menguji pengajuan cuti/izin gagal jika userId tidak ada.
     */
    it('gagal mengajukan cuti/izin jika userId tidak ada', async () => {
      const req = { user: {} };

      await expect(
        controller.requestLeave(
          req as any,
          { type: LeaveType.izin, description: 'Alasan' },
          null,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji pengajuan cuti/izin gagal jika terjadi error pada service.
     */
    it('gagal mengajukan cuti/izin jika service error', async () => {
      service.requestLeave.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_USER_ID } };

      await expect(
        controller.requestLeave(
          req as any,
          { type: LeaveType.izin, description: 'Alasan' },
          null,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint validateLeave
   * Menguji proses validasi cuti/izin oleh admin.
   */
  describe('validateLeave', () => {
    /**
     * Menguji validasi izin berhasil jika adminId valid.
     */
    it('berhasil validasi izin jika adminId valid', async () => {
      service.validateLeave.mockResolvedValue({ id: 2, status: 'izin' });
      const req = { user: { userId: MOCK_ADMIN_ID } };

      const result = await controller.validateLeave('2', 'izin', req as any);

      expect(result).toHaveProperty('status', 'izin');
      expect(service.validateLeave).toBeCalledWith(2, 'izin', MOCK_ADMIN_ID);
    });

    /**
     * Menguji validasi izin gagal jika adminId tidak ada.
     */
    it('gagal validasi izin jika adminId tidak ada', async () => {
      const req = { user: {} };

      await expect(
        controller.validateLeave('2', 'izin', req as any),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji validasi izin gagal jika terjadi error pada service.
     */
    it('gagal validasi izin jika service error', async () => {
      service.validateLeave.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_ADMIN_ID } };

      await expect(
        controller.validateLeave('2', 'izin', req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint exportUserAttendancePdf
   * Menguji proses ekspor presensi user tertentu ke PDF oleh admin.
   */
  describe('exportUserAttendancePdf', () => {
    /**
     * Menguji ekspor PDF presensi user berhasil.
     */
    it('berhasil ekspor PDF presensi user', async () => {
      service.exportUserAttendancePdf.mockResolvedValue(MOCK_PDF_BUFFER);
      const req = { user: { name: MOCK_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };

      await controller.exportUserAttendancePdf(
        '123',
        MOCK_START_DATE,
        MOCK_END_DATE,
        res as any,
        req as any,
      );

      expect(service.exportUserAttendancePdf).toBeCalledWith(
        123,
        { startDate: MOCK_START_DATE, endDate: MOCK_END_DATE },
        MOCK_NAME,
      );
      expect(res.set).toBeCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="presensi-intern-123.pdf"`,
      });
      expect(res.end).toBeCalledWith(MOCK_PDF_BUFFER);
    });

    /**
     * Menguji ekspor PDF presensi user gagal jika terjadi error pada service.
     */
    it('gagal ekspor PDF presensi user jika service error', async () => {
      service.exportUserAttendancePdf.mockRejectedValue(new Error('error'));
      const req = { user: { name: MOCK_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };

      await expect(
        controller.exportUserAttendancePdf(
          '123',
          MOCK_START_DATE,
          MOCK_END_DATE,
          res as any,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });
});
