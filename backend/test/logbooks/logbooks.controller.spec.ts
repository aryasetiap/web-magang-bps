/**
 * Unit Test LogbooksController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama LogbooksController,
 * termasuk create, findAll, getAllLogbooks (admin), findOne,
 * update, remove, dan exportUserLogbookReport.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { LogbooksController } from '../../src/logbooks/logbooks.controller';
import { LogbooksService } from '../../src/logbooks/logbooks.service';
import { CreateLogbookDto } from '../../src/logbooks/dto/create-logbook.dto';
import { UpdateLogbookDto } from '../../src/logbooks/dto/update-logbook.dto';

/**
 * Konstanta untuk data dummy yang sering digunakan pada pengujian.
 */
const DUMMY_USER_ID = 1;
const DUMMY_ADMIN_NAME = 'Admin';
const DUMMY_LOGBOOK_ID = 1;
const DUMMY_LOGBOOK_DTO: CreateLogbookDto = {
  logDate: '2025-07-01',
  content: 'Aktivitas harian',
};
const DUMMY_UPDATE_DTO: UpdateLogbookDto = {
  content: 'Update',
  status: 'submitted',
};
const DUMMY_PDF_BUFFER = Buffer.from('PDFDATA');
const DUMMY_START_DATE = '2025-07-01';
const DUMMY_END_DATE = '2025-07-31';

describe('LogbooksController', () => {
  /**
   * Deklarasi variabel controller dan service mock.
   */
  let controller: LogbooksController;
  let service: Record<string, jest.Mock>;

  /**
   * Setup sebelum setiap pengujian.
   * Membuat mock service dan inisialisasi controller.
   */
  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      exportUserLogbookReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbooksController],
      providers: [{ provide: LogbooksService, useValue: service }],
    }).compile();

    controller = module.get<LogbooksController>(LogbooksController);
  });

  /**
   * Pengujian endpoint create
   * -----------------------------------------------
   * Menguji pembuatan logbook baru oleh user.
   */
  describe('create', () => {
    /**
     * Pengujian berhasil membuat logbook.
     * Memastikan service dipanggil dengan parameter yang benar dan hasil sesuai.
     */
    it('berhasil membuat logbook', async () => {
      /**
       * Tujuan: Memastikan logbook berhasil dibuat dan hasilnya sesuai dengan yang diharapkan.
       */
      const req = { user: { userId: DUMMY_USER_ID } };
      service.create.mockResolvedValue({
        id: DUMMY_LOGBOOK_ID,
        ...DUMMY_LOGBOOK_DTO,
      });

      const result = await controller.create(req as any, DUMMY_LOGBOOK_DTO);

      expect(result).toEqual({ id: DUMMY_LOGBOOK_ID, ...DUMMY_LOGBOOK_DTO });
      expect(service.create).toBeCalledWith(DUMMY_USER_ID, DUMMY_LOGBOOK_DTO);
    });

    /**
     * Pengujian gagal membuat logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: DUMMY_USER_ID } };
      service.create.mockRejectedValue(new Error('error'));

      await expect(
        controller.create(req as any, DUMMY_LOGBOOK_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findAll
   * -----------------------------------------------
   * Menguji pengambilan seluruh logbook milik user.
   */
  describe('findAll', () => {
    /**
     * Pengujian berhasil mengambil seluruh logbook user.
     */
    it('berhasil mengambil seluruh logbook milik user', async () => {
      /**
       * Tujuan: Memastikan seluruh logbook user dapat diambil dengan benar.
       */
      const req = { user: { userId: 2 } };
      const dummyLogbooks = [{ id: 1 }, { id: 2 }];
      service.findAll.mockResolvedValue(dummyLogbooks);

      const result = await controller.findAll(req as any);

      expect(result).toEqual(dummyLogbooks);
      expect(service.findAll).toBeCalledWith(2);
    });

    /**
     * Pengujian gagal mengambil logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 2 } };
      service.findAll.mockRejectedValue(new Error('error'));

      await expect(controller.findAll(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint getAllLogbooks (admin)
   * -----------------------------------------------
   * Menguji pengambilan seluruh logbook untuk admin (dengan pagination).
   */
  describe('getAllLogbooks', () => {
    /**
     * Pengujian berhasil mengambil seluruh logbook untuk admin.
     */
    it('berhasil mengambil seluruh logbook untuk admin', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengambil seluruh logbook dengan pagination.
       */
      const dummyResult = {
        data: [{ id: 1 }],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      service.findAllForAdmin.mockResolvedValue(dummyResult);

      const result = await controller.getAllLogbooks(1, 10);

      expect(result).toEqual(dummyResult);
      expect(service.findAllForAdmin).toBeCalledWith(1, 10);
    });

    /**
     * Pengujian gagal mengambil logbook admin jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      service.findAllForAdmin.mockRejectedValue(new Error('error'));

      await expect(controller.getAllLogbooks(1, 10)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findOne
   * -----------------------------------------------
   * Menguji pengambilan detail logbook tertentu milik user.
   */
  describe('findOne', () => {
    /**
     * Pengujian berhasil mengambil detail logbook.
     */
    it('berhasil mengambil detail logbook', async () => {
      /**
       * Tujuan: Memastikan detail logbook dapat diambil sesuai user dan id logbook.
       */
      const req = { user: { userId: 3 } };
      const dummyLogbook = { id: 1, userId: 3 };
      service.findOne.mockResolvedValue(dummyLogbook);

      const result = await controller.findOne(req as any, 1);

      expect(result).toEqual(dummyLogbook);
      expect(service.findOne).toBeCalledWith(3, 1);
    });

    /**
     * Pengujian gagal mengambil detail logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 3 } };
      service.findOne.mockRejectedValue(new Error('error'));

      await expect(controller.findOne(req as any, 1)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint update
   * -----------------------------------------------
   * Menguji update logbook milik user.
   */
  describe('update', () => {
    /**
     * Pengujian berhasil update logbook.
     */
    it('berhasil update logbook', async () => {
      /**
       * Tujuan: Memastikan logbook dapat diupdate dengan data baru.
       */
      const req = { user: { userId: 4 } };
      const updatedLogbook = { id: 1, ...DUMMY_UPDATE_DTO };
      service.update.mockResolvedValue(updatedLogbook);

      const result = await controller.update(req as any, 1, DUMMY_UPDATE_DTO);

      expect(result).toEqual(updatedLogbook);
      expect(service.update).toBeCalledWith(4, 1, DUMMY_UPDATE_DTO);
    });

    /**
     * Pengujian gagal update logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 4 } };
      service.update.mockRejectedValue(new Error('error'));

      await expect(
        controller.update(req as any, 1, DUMMY_UPDATE_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint remove
   * -----------------------------------------------
   * Menguji penghapusan logbook milik user.
   */
  describe('remove', () => {
    /**
     * Pengujian berhasil menghapus logbook.
     */
    it('berhasil menghapus logbook', async () => {
      /**
       * Tujuan: Memastikan logbook dapat dihapus oleh user yang bersangkutan.
       */
      const req = { user: { userId: 5 } };
      const deletedLogbook = { id: 1 };
      service.remove.mockResolvedValue(deletedLogbook);

      const result = await controller.remove(req as any, 1);

      expect(result).toEqual(deletedLogbook);
      expect(service.remove).toBeCalledWith(5, 1);
    });

    /**
     * Pengujian gagal menghapus logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 5 } };
      service.remove.mockRejectedValue(new Error('error'));

      await expect(controller.remove(req as any, 1)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint exportUserLogbookReport (admin)
   * -----------------------------------------------
   * Menguji ekspor laporan logbook user dalam format PDF oleh admin.
   */
  describe('exportUserLogbookReport', () => {
    /**
     * Pengujian berhasil ekspor PDF logbook.
     */
    it('berhasil ekspor PDF logbook', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengekspor logbook user dalam format PDF.
       */
      const req = { user: { name: DUMMY_ADMIN_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };
      service.exportUserLogbookReport.mockResolvedValue(DUMMY_PDF_BUFFER);

      await controller.exportUserLogbookReport(
        10,
        DUMMY_START_DATE,
        DUMMY_END_DATE,
        req as any,
        res as any,
      );

      expect(service.exportUserLogbookReport).toBeCalledWith(
        10,
        { startDate: DUMMY_START_DATE, endDate: DUMMY_END_DATE },
        DUMMY_ADMIN_NAME,
      );
      expect(res.set).toBeCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="logbook-intern-10.pdf"`,
      });
      expect(res.end).toBeCalledWith(DUMMY_PDF_BUFFER);
    });

    /**
     * Pengujian gagal ekspor PDF logbook jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar saat ekspor PDF.
       */
      const req = { user: { name: DUMMY_ADMIN_NAME } };
      const res = { set: jest.fn(), end: jest.fn() };
      service.exportUserLogbookReport.mockRejectedValue(new Error('error'));

      await expect(
        controller.exportUserLogbookReport(
          10,
          DUMMY_START_DATE,
          DUMMY_END_DATE,
          req as any,
          res as any,
        ),
      ).rejects.toThrow('error');
    });
  });
});
