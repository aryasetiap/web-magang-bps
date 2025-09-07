/**
 * Unit Test untuk InternshipApplicationsController
 * -------------------------------------------------
 * File ini berisi pengujian seluruh endpoint utama pada InternshipApplicationsController,
 * meliputi create, findAll, getMyApplication, findOne, updateStatus, dan update.
 * Setiap bagian pengujian didokumentasikan dengan docstring berbahasa Indonesia
 * untuk memperjelas tujuan dan cakupan pengujian.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { InternshipApplicationsController } from '../../src/internship-applications/internship-applications.controller';
import { InternshipApplicationsService } from '../../src/internship-applications/internship-applications.service';
import { CreateInternshipApplicationDto } from '../../src/internship-applications/dto/create-internship-application.dto';
import { UpdateInternshipApplicationDto } from '../../src/internship-applications/dto/update-internship-application.dto';
import { UpdateApplicationStatusDto } from '../../src/internship-applications/dto/update-application-status.dto';

// Konstanta untuk data dummy yang sering digunakan
const MOCK_USER_ID = 1;
const MOCK_ADMIN_ID = 99;
const MOCK_APPLICATION_ID = 1;
const MOCK_QUERY = { page: 1, limit: 10 };
const MOCK_FILES = {
  cv: [{ path: 'cv.pdf' }],
  transcript: [{ path: 'transcript.pdf' }],
  requestLetter: [{ path: 'letter.pdf' }],
};
const MOCK_CREATE_DTO: CreateInternshipApplicationDto = {
  startDate: '2025-07-01',
  endDate: '2025-08-01',
};
const MOCK_UPDATE_DTO: UpdateInternshipApplicationDto = {
  startDate: '2025-07-01',
};
const MOCK_STATUS_DTO: UpdateApplicationStatusDto = {
  status: 'diterima',
  feedback: 'ok',
  startDate: '2025-07-01',
  endDate: '2025-08-01',
} as any;

describe('InternshipApplicationsController', () => {
  /**
   * Pengujian utama untuk InternshipApplicationsController.
   * Melakukan setup controller dan service mock sebelum setiap pengujian.
   */
  let controller: InternshipApplicationsController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternshipApplicationsController],
      providers: [
        { provide: InternshipApplicationsService, useValue: service },
      ],
    }).compile();

    controller = module.get<InternshipApplicationsController>(
      InternshipApplicationsController,
    );
  });

  /**
   * Pengujian endpoint create
   * -----------------------------------------------
   * Menguji proses pembuatan aplikasi magang baru.
   */
  describe('create', () => {
    /**
     * Pengujian berhasil membuat aplikasi magang.
     * Memastikan service dipanggil dengan parameter yang benar dan hasil dikembalikan sesuai.
     */
    it('berhasil membuat aplikasi magang', async () => {
      service.create.mockResolvedValue({ id: MOCK_APPLICATION_ID });
      const req = { user: { userId: MOCK_USER_ID } };

      const result = await controller.create(
        MOCK_FILES as any,
        req as any,
        MOCK_CREATE_DTO,
      );

      expect(result).toEqual({ id: MOCK_APPLICATION_ID });
      expect(service.create).toBeCalledWith(
        MOCK_USER_ID,
        MOCK_CREATE_DTO,
        MOCK_FILES,
      );
    });

    /**
     * Pengujian gagal membuat aplikasi magang jika terjadi error pada service.
     * Memastikan error dilemparkan dengan benar.
     */
    it('gagal jika service error', async () => {
      service.create.mockRejectedValue(new Error('error'));
      const req = { user: { userId: MOCK_USER_ID } };

      await expect(
        controller.create(MOCK_FILES as any, req as any, MOCK_CREATE_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findAll
   * -----------------------------------------------
   * Menguji proses pengambilan seluruh aplikasi magang (dengan pagination).
   */
  describe('findAll', () => {
    /**
     * Pengujian berhasil mengambil seluruh aplikasi magang.
     * Memastikan hasil dan parameter yang dikirim ke service sudah benar.
     */
    it('berhasil mengambil seluruh aplikasi magang', async () => {
      const mockResponse = {
        data: [{ id: MOCK_APPLICATION_ID }],
        meta: { totalItems: 1 },
      };
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(MOCK_QUERY as any);

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toBeCalledWith(MOCK_QUERY);
    });

    /**
     * Pengujian gagal mengambil data jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      service.findAll.mockRejectedValue(new Error('error'));

      await expect(controller.findAll(MOCK_QUERY as any)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint getMyApplication
   * -----------------------------------------------
   * Menguji proses pengambilan aplikasi magang milik user tertentu.
   */
  describe('getMyApplication', () => {
    /**
     * Pengujian berhasil mengambil aplikasi magang milik user.
     */
    it('berhasil mengambil aplikasi magang milik user', async () => {
      const req = { user: { userId: 2 } };
      const mockData = [{ id: 1 }, { id: 2 }];
      service.findByUser.mockResolvedValue(mockData);

      const result = await controller.getMyApplication(req as any);

      expect(result).toEqual({ data: mockData });
      expect(service.findByUser).toBeCalledWith(2);
    });

    /**
     * Pengujian gagal mengambil data jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: 2 } };
      service.findByUser.mockRejectedValue(new Error('error'));

      await expect(controller.getMyApplication(req as any)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint findOne
   * -----------------------------------------------
   * Menguji proses pengambilan detail aplikasi magang berdasarkan ID.
   */
  describe('findOne', () => {
    /**
     * Pengujian berhasil mengambil detail aplikasi magang.
     */
    it('berhasil mengambil detail aplikasi magang', async () => {
      const mockDetail = { id: MOCK_APPLICATION_ID, cvUrl: 'url' };
      service.findOne.mockResolvedValue(mockDetail);

      const result = await controller.findOne(String(MOCK_APPLICATION_ID));

      expect(result).toEqual(mockDetail);
      expect(service.findOne).toBeCalledWith(MOCK_APPLICATION_ID);
    });

    /**
     * Pengujian gagal mengambil detail jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      service.findOne.mockRejectedValue(new Error('error'));

      await expect(
        controller.findOne(String(MOCK_APPLICATION_ID)),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint updateStatus
   * -----------------------------------------------
   * Menguji proses update status aplikasi magang oleh admin.
   */
  describe('updateStatus', () => {
    /**
     * Pengujian berhasil update status aplikasi magang.
     */
    it('berhasil update status aplikasi magang', async () => {
      const req = { user: { userId: MOCK_ADMIN_ID } };
      const mockResult = { id: MOCK_APPLICATION_ID, status: 'diterima' };
      service.updateStatus.mockResolvedValue(mockResult);

      const result = await controller.updateStatus(
        String(MOCK_APPLICATION_ID),
        MOCK_STATUS_DTO,
        req as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.updateStatus).toBeCalledWith(
        MOCK_APPLICATION_ID,
        MOCK_ADMIN_ID,
        MOCK_STATUS_DTO,
      );
    });

    /**
     * Pengujian gagal update status jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: MOCK_ADMIN_ID } };
      service.updateStatus.mockRejectedValue(new Error('error'));

      await expect(
        controller.updateStatus(
          String(MOCK_APPLICATION_ID),
          MOCK_STATUS_DTO,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint update
   * -----------------------------------------------
   * Menguji proses update data aplikasi magang oleh user.
   */
  describe('update', () => {
    /**
     * Pengujian berhasil update aplikasi magang.
     */
    it('berhasil update aplikasi magang', async () => {
      const req = { user: { userId: 2 } };
      const mockResult = { id: MOCK_APPLICATION_ID, startDate: '2025-07-01' };
      service.update.mockResolvedValue(mockResult);

      const result = await controller.update(
        String(MOCK_APPLICATION_ID),
        MOCK_UPDATE_DTO,
        req as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.update).toBeCalledWith(
        MOCK_APPLICATION_ID,
        2,
        MOCK_UPDATE_DTO,
      );
    });

    /**
     * Pengujian gagal update aplikasi magang jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: 2 } };
      service.update.mockRejectedValue(new Error('error'));

      await expect(
        controller.update(
          String(MOCK_APPLICATION_ID),
          MOCK_UPDATE_DTO,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });
});
