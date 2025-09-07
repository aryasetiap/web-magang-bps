/**
 * Unit Test InternshipApplicationsService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama InternshipApplicationsService, termasuk create,
 * findAll, findOne, updateStatus, update, dan findByUser.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 *
 * Tujuan: Memastikan seluruh fungsi utama berjalan sesuai ekspektasi,
 * termasuk validasi, error handling, dan integrasi dengan dependensi eksternal.
 */

import { InternshipApplicationsService } from '../../src/internship-applications/internship-applications.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { StatusInternship } from '@prisma/client';
import * as MockDate from 'mockdate';

jest.mock('fs');

// Konstanta untuk magic number/string yang sering digunakan
const USER_ID = 1;
const ADMIN_ID = 99;
const VALID_START_DATE = '2025-07-01';
const VALID_END_DATE = '2025-08-01';
const INVALID_START_DATE = '2025-08-01';
const INVALID_END_DATE = '2025-07-01';
const SHORT_END_DATE = '2025-07-15';
const LONG_START_DATE = '2025-01-01';
const LONG_END_DATE = '2025-08-01';
const PAST_DATE = '2025-05-31';
const MOCK_DATE_NOW = '2025-06-01T10:00:00Z';
const FILE_SIZE_LIMIT = 2 * 1024 * 1024;

const mockFile = {
  fieldname: 'cv',
  originalname: 'cv.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  destination: 'uploads/cv',
  filename: 'cv.pdf',
  path: 'cv.pdf',
  size: 1000,
  stream: {} as any,
  buffer: Buffer.from(''),
};
const mockTranscript = {
  ...mockFile,
  fieldname: 'transcript',
  originalname: 'transcript.pdf',
  destination: 'uploads/transcript',
  filename: 'transcript.pdf',
  path: 'transcript.pdf',
};
const mockRequestLetter = {
  ...mockFile,
  fieldname: 'requestLetter',
  originalname: 'letter.pdf',
  destination: 'uploads/requestLetter',
  filename: 'letter.pdf',
  path: 'letter.pdf',
};
const validFiles = {
  cv: [mockFile],
  transcript: [mockTranscript],
  requestLetter: [mockRequestLetter],
};

describe('InternshipApplicationsService', () => {
  /**
   * Inisialisasi service dan mock dependensi sebelum setiap pengujian.
   */
  let service: InternshipApplicationsService;
  let prisma: any;
  let fsMock: any;

  beforeEach(() => {
    prisma = {
      internshipApplication: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    fsMock = require('fs');
    fsMock.unlinkSync = jest.fn();

    service = new InternshipApplicationsService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
    MockDate.reset();
  });

  /**
   * Pengujian fitur create aplikasi magang.
   * Memastikan validasi file, tanggal, dan status berjalan dengan benar.
   */
  describe('create', () => {
    /**
     * Set tanggal saat ini ke waktu tertentu agar validasi tanggal konsisten.
     */
    beforeEach(() => {
      MockDate.set(MOCK_DATE_NOW);
    });

    const dto = { startDate: VALID_START_DATE, endDate: VALID_END_DATE };

    it('berhasil membuat aplikasi magang jika data valid', async () => {
      /**
       * Pengujian: Berhasil membuat aplikasi magang jika seluruh data dan file valid.
       */
      prisma.internshipApplication.findFirst.mockResolvedValue(null);
      prisma.internshipApplication.create.mockResolvedValue({ id: 1 });

      const result = await service.create(USER_ID, dto, validFiles);

      expect(result).toHaveProperty('id', 1);
      expect(prisma.internshipApplication.create).toBeCalledWith({
        data: expect.objectContaining({
          userId: USER_ID,
          cvPath: mockFile.filename,
          transcriptPath: mockTranscript.filename,
          requestLetterPath: mockRequestLetter.filename,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
        }),
      });
    });

    it('gagal jika file wajib tidak diupload', async () => {
      /**
       * Pengujian: Gagal jika salah satu file wajib tidak diupload.
       */
      const filesInvalid = { cv: [mockFile] };
      await expect(service.create(USER_ID, dto, filesInvalid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('gagal jika file bukan PDF', async () => {
      /**
       * Pengujian: Gagal jika salah satu file bukan PDF.
       */
      const filesInvalid = {
        cv: [
          {
            ...mockFile,
            mimetype: 'application/msword',
            originalname: 'cv.doc',
          },
        ],
        transcript: [mockTranscript],
        requestLetter: [mockRequestLetter],
      };
      await expect(service.create(USER_ID, dto, filesInvalid)).rejects.toThrow(
        BadRequestException,
      );
      expect(fsMock.unlinkSync).toBeCalled();
    });

    it('gagal jika file melebihi 2MB', async () => {
      /**
       * Pengujian: Gagal jika salah satu file melebihi batas ukuran 2MB.
       */
      const filesInvalid = {
        cv: [{ ...mockFile, size: 3 * 1024 * 1024 }],
        transcript: [mockTranscript],
        requestLetter: [mockRequestLetter],
      };
      await expect(service.create(USER_ID, dto, filesInvalid)).rejects.toThrow(
        BadRequestException,
      );
      expect(fsMock.unlinkSync).toBeCalled();
    });

    it('gagal jika user sudah pernah mendaftar dan status belum ditolak', async () => {
      /**
       * Pengujian: Gagal jika user sudah pernah mendaftar dan status aplikasi sebelumnya belum ditolak.
       */
      prisma.internshipApplication.findFirst.mockResolvedValue({
        id: 2,
        status: 'pending',
      });
      await expect(service.create(USER_ID, dto, validFiles)).rejects.toThrow(
        ConflictException,
      );
      expect(fsMock.unlinkSync).toBeCalled();
    });

    it('gagal jika tanggal mulai >= tanggal selesai', async () => {
      /**
       * Pengujian: Gagal jika tanggal mulai lebih besar atau sama dengan tanggal selesai.
       */
      const dtoInvalid = {
        startDate: INVALID_START_DATE,
        endDate: INVALID_END_DATE,
      };
      await expect(
        service.create(USER_ID, dtoInvalid, validFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika durasi magang < 1 bulan', async () => {
      /**
       * Pengujian: Gagal jika durasi magang kurang dari 1 bulan.
       */
      const dtoInvalid = {
        startDate: VALID_START_DATE,
        endDate: SHORT_END_DATE,
      };
      await expect(
        service.create(USER_ID, dtoInvalid, validFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika durasi magang > 6 bulan', async () => {
      /**
       * Pengujian: Gagal jika durasi magang lebih dari 6 bulan.
       */
      const dtoInvalid = { startDate: LONG_START_DATE, endDate: LONG_END_DATE };
      await expect(
        service.create(USER_ID, dtoInvalid, validFiles),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika tanggal mulai di masa lalu (bukan admin)', async () => {
      /**
       * Pengujian: Gagal jika tanggal mulai magang di masa lalu (bukan admin).
       */
      const dtoInvalid = { startDate: PAST_DATE, endDate: VALID_END_DATE };
      await expect(
        service.create(USER_ID, dtoInvalid, validFiles),
      ).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Pengujian fitur findAll aplikasi magang.
   * Memastikan data dikembalikan dengan paginasi yang benar.
   */
  describe('findAll', () => {
    it('mengembalikan data aplikasi magang dengan paginasi', async () => {
      /**
       * Pengujian: Berhasil mengembalikan data aplikasi magang beserta meta paginasi.
       */
      prisma.$transaction.mockResolvedValue([[{ id: 1 }], 1]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(prisma.$transaction).toBeCalled();
    });
  });

  /**
   * Pengujian fitur findOne aplikasi magang.
   * Memastikan detail aplikasi dikembalikan jika ditemukan, dan error jika tidak.
   */
  describe('findOne', () => {
    it('mengembalikan detail aplikasi magang jika ditemukan', async () => {
      /**
       * Pengujian: Berhasil mengembalikan detail aplikasi magang jika data ditemukan.
       */
      prisma.internshipApplication.findUnique.mockResolvedValue({
        id: 1,
        cvPath: mockFile.filename,
        transcriptPath: mockTranscript.filename,
        requestLetterPath: mockRequestLetter.filename,
      });
      const result = await service.findOne(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('cvUrl');
      expect(result).toHaveProperty('transcriptUrl');
      expect(result).toHaveProperty('requestLetterUrl');
    });

    it('melempar NotFoundException jika aplikasi tidak ditemukan', async () => {
      /**
       * Pengujian: Melempar NotFoundException jika aplikasi magang tidak ditemukan.
       */
      prisma.internshipApplication.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian fitur updateStatus aplikasi magang.
   * Memastikan validasi tanggal dan status berjalan dengan benar.
   */
  describe('updateStatus', () => {
    it('berhasil update status aplikasi magang', async () => {
      /**
       * Pengujian: Berhasil mengubah status aplikasi magang jika data valid.
       */
      prisma.internshipApplication.update.mockResolvedValue({
        id: 1,
        status: StatusInternship.diterima,
      });
      const dto = {
        status: StatusInternship.diterima,
        feedback: 'ok',
        startDate: VALID_START_DATE,
        endDate: VALID_END_DATE,
      };
      const result = await service.updateStatus(1, ADMIN_ID, dto);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('status', StatusInternship.diterima);
      expect(prisma.internshipApplication.update).toBeCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: StatusInternship.diterima,
          feedback: 'ok',
          verifiedBy: ADMIN_ID,
          verifiedAt: expect.any(Date),
          startDate: new Date(VALID_START_DATE),
          endDate: new Date(VALID_END_DATE),
        }),
      });
    });

    it('gagal jika tanggal mulai >= tanggal selesai', async () => {
      /**
       * Pengujian: Gagal update status jika tanggal mulai >= tanggal selesai.
       */
      const dto = {
        status: StatusInternship.diterima,
        startDate: INVALID_START_DATE,
        endDate: INVALID_END_DATE,
      };
      await expect(service.updateStatus(1, ADMIN_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('gagal jika durasi magang < 1 bulan', async () => {
      /**
       * Pengujian: Gagal update status jika durasi magang kurang dari 1 bulan.
       */
      const dto = {
        status: StatusInternship.diterima,
        startDate: VALID_START_DATE,
        endDate: SHORT_END_DATE,
      };
      await expect(service.updateStatus(1, ADMIN_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('gagal jika durasi magang > 6 bulan', async () => {
      /**
       * Pengujian: Gagal update status jika durasi magang lebih dari 6 bulan.
       */
      const dto = {
        status: StatusInternship.diterima,
        startDate: LONG_START_DATE,
        endDate: LONG_END_DATE,
      };
      await expect(service.updateStatus(1, ADMIN_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian fitur update aplikasi magang.
   * Memastikan hanya pemilik aplikasi yang dapat melakukan update.
   */
  describe('update', () => {
    it('berhasil update aplikasi magang jika user adalah pemilik', async () => {
      /**
       * Pengujian: Berhasil update aplikasi magang jika user adalah pemilik aplikasi.
       */
      prisma.internshipApplication.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
      });
      prisma.internshipApplication.update.mockResolvedValue({
        id: 1,
        userId: 2,
        startDate: VALID_START_DATE,
        endDate: VALID_END_DATE,
      });

      const result = await service.update(1, 2, {
        startDate: VALID_START_DATE,
        endDate: VALID_END_DATE,
      });

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('startDate', VALID_START_DATE);
      expect(prisma.internshipApplication.update).toBeCalledWith({
        where: { id: 1 },
        data: { startDate: VALID_START_DATE, endDate: VALID_END_DATE },
      });
    });

    it('melempar NotFoundException jika aplikasi tidak ditemukan', async () => {
      /**
       * Pengujian: Melempar NotFoundException jika aplikasi magang tidak ditemukan.
       */
      prisma.internshipApplication.findUnique.mockResolvedValue(null);
      await expect(
        service.update(1, 2, { startDate: VALID_START_DATE }),
      ).rejects.toThrow(NotFoundException);
    });

    it('melempar ForbiddenException jika user bukan pemilik aplikasi', async () => {
      /**
       * Pengujian: Melempar ForbiddenException jika user bukan pemilik aplikasi.
       */
      prisma.internshipApplication.findUnique.mockResolvedValue({
        id: 1,
        userId: 3,
      });
      await expect(
        service.update(1, 2, { startDate: VALID_START_DATE }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /**
   * Pengujian fitur findByUser aplikasi magang.
   * Memastikan hanya aplikasi milik user yang dikembalikan.
   */
  describe('findByUser', () => {
    it('mengembalikan daftar aplikasi magang milik user', async () => {
      /**
       * Pengujian: Berhasil mengembalikan seluruh aplikasi magang milik user tertentu.
       */
      prisma.internshipApplication.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      const result = await service.findByUser(USER_ID);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id', 1);
      expect(prisma.internshipApplication.findMany).toBeCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
