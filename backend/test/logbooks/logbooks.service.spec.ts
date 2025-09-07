/**
 * Unit Test LogbooksService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama LogbooksService, termasuk create, findAll,
 * findOne, update, remove, findAllForAdmin, dan exportUserLogbookReport.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { LogbooksService } from '../../src/logbooks/logbooks.service';
import { StatusLogbook } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('fs');

// Mock pdfmake agar menyertakan method .end()
jest.mock('pdfmake', () => {
  /**
   * Mock PdfPrinter dari pdfmake agar createPdfKitDocument mengembalikan
   * EventEmitter dengan method .end() dan simulasi stream data.
   */
  const EventEmitter = require('events');
  const createPdfKitDocumentMock = jest.fn(() => {
    const fakePdf = new EventEmitter();
    (fakePdf as any).end = jest.fn();
    setTimeout(() => {
      fakePdf.emit('data', Buffer.from('pdf-chunk'));
      fakePdf.emit('end');
    }, 10);
    return fakePdf;
  });
  return jest.fn().mockImplementation(() => ({
    createPdfKitDocument: createPdfKitDocumentMock,
  }));
});

// Mock path.resolve agar selalu mengembalikan path yang sama
jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  return {
    ...actualPath,
    resolve: jest.fn(() => 'mocked/path/header_report.png'),
  };
});

// Konstanta untuk data dummy yang sering digunakan
const DUMMY_USER_ID = 1;
const DUMMY_OTHER_USER_ID = 2;
const DUMMY_LOGBOOK_ID = 1;
const DUMMY_DATE = '2025-07-01';
const DUMMY_CONTENT = 'Isi logbook';
const DUMMY_USER = {
  id: DUMMY_USER_ID,
  name: 'Budi',
  asalInstitusi: 'ITS',
};
const DUMMY_LOGBOOK = {
  id: DUMMY_LOGBOOK_ID,
  userId: DUMMY_USER_ID,
  logDate: new Date(DUMMY_DATE),
  content: DUMMY_CONTENT,
  status: StatusLogbook.submitted,
};

describe('LogbooksService', () => {
  /**
   * Inisialisasi variabel yang digunakan di seluruh test.
   */
  let service: LogbooksService;
  let prisma: any;
  let fsMock: any;

  beforeEach(() => {
    /**
     * Setup mock Prisma dan fs sebelum setiap pengujian.
     */
    prisma = {
      logbook: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    fsMock = require('fs');
    fsMock.existsSync = jest.fn();
    fsMock.readFileSync = jest.fn();
    service = new LogbooksService(prisma);
  });

  afterEach(() => {
    /**
     * Membersihkan seluruh mock setelah setiap pengujian.
     */
    jest.clearAllMocks();
  });

  /**
   * Pengujian fitur create logbook.
   */
  describe('create', () => {
    /**
     * Pengujian berhasil membuat logbook jika belum ada di tanggal yang sama.
     */
    it('berhasil membuat logbook jika belum ada di tanggal yang sama', async () => {
      /**
       * Test ini memastikan bahwa user dapat membuat logbook baru
       * jika belum ada logbook pada tanggal yang sama.
       */
      prisma.logbook.findFirst.mockResolvedValue(null);
      prisma.logbook.create.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        content: DUMMY_CONTENT,
      });

      const dto = { logDate: DUMMY_DATE, content: DUMMY_CONTENT };
      const result = await service.create(DUMMY_USER_ID, dto);

      expect(result).toHaveProperty('id', DUMMY_LOGBOOK_ID);
      expect(prisma.logbook.create).toBeCalledWith({
        data: {
          userId: DUMMY_USER_ID,
          logDate: new Date(DUMMY_DATE),
          content: DUMMY_CONTENT,
        },
      });
    });

    /**
     * Pengujian gagal membuat logbook jika sudah ada di tanggal yang sama.
     */
    it('gagal jika sudah ada logbook di tanggal yang sama', async () => {
      /**
       * Test ini memastikan bahwa user tidak dapat membuat logbook
       * pada tanggal yang sama lebih dari satu kali.
       */
      prisma.logbook.findFirst.mockResolvedValue({ id: 2 });
      const dto = { logDate: DUMMY_DATE, content: DUMMY_CONTENT };

      await expect(service.create(DUMMY_USER_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian fitur findAll logbook milik user.
   */
  describe('findAll', () => {
    /**
     * Pengujian mengembalikan daftar logbook milik user.
     */
    it('mengembalikan daftar logbook milik user', async () => {
      /**
       * Test ini memastikan bahwa user dapat mengambil seluruh logbook miliknya.
       */
      prisma.logbook.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll(DUMMY_USER_ID);
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.logbook.findMany).toBeCalledWith({
        where: { userId: DUMMY_USER_ID },
        orderBy: { logDate: 'desc' },
      });
    });
  });

  /**
   * Pengujian fitur findOne logbook (verifikasi kepemilikan).
   */
  describe('findOne', () => {
    /**
     * Pengujian mengembalikan logbook jika user adalah pemilik.
     */
    it('mengembalikan logbook jika user adalah pemilik', async () => {
      /**
       * Test ini memastikan user dapat mengambil logbook miliknya sendiri.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_USER_ID,
      });
      const result = await service.findOne(DUMMY_USER_ID, DUMMY_LOGBOOK_ID);
      expect(result).toHaveProperty('id', DUMMY_LOGBOOK_ID);
      expect(prisma.logbook.findUnique).toBeCalledWith({
        where: { id: DUMMY_LOGBOOK_ID },
      });
    });

    /**
     * Pengujian gagal jika logbook tidak ditemukan.
     */
    it('gagal jika logbook tidak ditemukan', async () => {
      /**
       * Test ini memastikan error dilempar jika logbook tidak ditemukan.
       */
      prisma.logbook.findUnique.mockResolvedValue(null);
      await expect(service.findOne(DUMMY_USER_ID, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * Pengujian gagal jika user bukan pemilik logbook.
     */
    it('gagal jika user bukan pemilik logbook', async () => {
      /**
       * Test ini memastikan user tidak dapat mengakses logbook milik orang lain.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_OTHER_USER_ID,
      });
      await expect(
        service.findOne(DUMMY_USER_ID, DUMMY_LOGBOOK_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /**
   * Pengujian fitur update logbook.
   */
  describe('update', () => {
    /**
     * Pengujian berhasil update logbook jika user adalah pemilik.
     */
    it('berhasil update logbook jika user adalah pemilik', async () => {
      /**
       * Test ini memastikan user dapat mengupdate logbook miliknya sendiri.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_USER_ID,
      });
      prisma.logbook.update.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        content: 'Baru',
      });

      const dto = { content: 'Baru', status: StatusLogbook.submitted };
      const result = await service.update(DUMMY_USER_ID, DUMMY_LOGBOOK_ID, dto);

      expect(result).toHaveProperty('content', 'Baru');
      expect(prisma.logbook.update).toBeCalledWith({
        where: { id: DUMMY_LOGBOOK_ID },
        data: expect.objectContaining({
          content: 'Baru',
          status: StatusLogbook.submitted,
        }),
      });
    });

    /**
     * Pengujian gagal update jika bukan pemilik.
     */
    it('gagal update jika bukan pemilik', async () => {
      /**
       * Test ini memastikan user tidak dapat mengupdate logbook milik orang lain.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_OTHER_USER_ID,
      });
      await expect(
        service.update(DUMMY_USER_ID, DUMMY_LOGBOOK_ID, { content: 'Baru' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /**
   * Pengujian fitur remove logbook.
   */
  describe('remove', () => {
    /**
     * Pengujian berhasil menghapus logbook jika user adalah pemilik.
     */
    it('berhasil menghapus logbook jika user adalah pemilik', async () => {
      /**
       * Test ini memastikan user dapat menghapus logbook miliknya sendiri.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_USER_ID,
      });
      prisma.logbook.delete.mockResolvedValue({ id: DUMMY_LOGBOOK_ID });

      const result = await service.remove(DUMMY_USER_ID, DUMMY_LOGBOOK_ID);

      expect(result).toHaveProperty('id', DUMMY_LOGBOOK_ID);
      expect(prisma.logbook.delete).toBeCalledWith({
        where: { id: DUMMY_LOGBOOK_ID },
      });
    });

    /**
     * Pengujian gagal hapus jika bukan pemilik.
     */
    it('gagal hapus jika bukan pemilik', async () => {
      /**
       * Test ini memastikan user tidak dapat menghapus logbook milik orang lain.
       */
      prisma.logbook.findUnique.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        userId: DUMMY_OTHER_USER_ID,
      });
      await expect(
        service.remove(DUMMY_USER_ID, DUMMY_LOGBOOK_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /**
   * Pengujian fitur findAllForAdmin (paginasi dan filter password).
   */
  describe('findAllForAdmin', () => {
    /**
     * Pengujian mengembalikan data logbook beserta user tanpa field password.
     */
    it('mengembalikan data logbook beserta user tanpa field password', async () => {
      /**
       * Test ini memastikan admin dapat mengambil data logbook beserta user,
       * dan field password user tidak ikut dikembalikan.
       */
      prisma.logbook.findMany.mockResolvedValue([
        { id: DUMMY_LOGBOOK_ID, user: { ...DUMMY_USER, password: 'secret' } },
      ]);
      prisma.logbook.count.mockResolvedValue(1);

      const result = await service.findAllForAdmin(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.data[0].user).not.toHaveProperty('password');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('lastPage', 1);
      expect(prisma.logbook.findMany).toBeCalled();
      expect(prisma.logbook.count).toBeCalled();
    });
  });

  /**
   * Pengujian fitur exportUserLogbookReport (export PDF).
   */
  describe('exportUserLogbookReport', () => {
    /**
     * Pengujian berhasil menghasilkan Buffer PDF tanpa header image.
     */
    it('berhasil menghasilkan Buffer PDF', async () => {
      /**
       * Test ini memastikan export PDF berhasil walaupun file header image tidak ada.
       */
      prisma.logbook.findMany.mockResolvedValue([
        {
          id: DUMMY_LOGBOOK_ID,
          logDate: new Date(DUMMY_DATE),
          status: 'submitted',
          content: 'Aktivitas',
        },
      ]);
      prisma.user.findUnique.mockResolvedValue(DUMMY_USER);
      fsMock.existsSync.mockReturnValue(false);

      const buffer = await service.exportUserLogbookReport(
        DUMMY_USER_ID,
        { startDate: DUMMY_DATE, endDate: '2025-07-31' },
        'Admin',
      );
      expect(buffer).toBeInstanceOf(Buffer);
    });

    /**
     * Pengujian berhasil export PDF dengan header image jika file ada.
     */
    it('berhasil export PDF dengan header image jika file ada', async () => {
      /**
       * Test ini memastikan export PDF berhasil dan menyisipkan header image jika file ada.
       */
      prisma.logbook.findMany.mockResolvedValue([
        {
          id: DUMMY_LOGBOOK_ID,
          logDate: new Date(DUMMY_DATE),
          status: 'submitted',
          content: 'Aktivitas',
        },
      ]);
      prisma.user.findUnique.mockResolvedValue(DUMMY_USER);
      fsMock.existsSync.mockReturnValue(true);
      fsMock.readFileSync.mockReturnValue(Buffer.from('image'));

      const buffer = await service.exportUserLogbookReport(
        DUMMY_USER_ID,
        { startDate: DUMMY_DATE, endDate: '2025-07-31' },
        'Admin',
      );
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });
});
