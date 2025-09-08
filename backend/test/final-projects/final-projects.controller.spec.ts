/**
 * Unit Test FinalProjectsController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama FinalProjectsController,
 * termasuk create, findAllForUser, findAllForAdmin, findOne,
 * update, review, dan remove. Setiap pengujian didokumentasikan
 * dengan komentar berbahasa Indonesia untuk memperjelas tujuan
 * dan cakupan pengujian.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsController } from '../../src/final-projects/final-projects.controller';
import { FinalProjectsService } from '../../src/final-projects/final-projects.service';
import { CreateFinalProjectDto } from '../../src/final-projects/dto/create-final-project.dto';
import { UpdateFinalProjectDto } from '../../src/final-projects/dto/update-final-project.dto';
import { ReviewFinalProjectDto } from '../../src/final-projects/dto/review-final-project.dto';
import { Response } from 'express';

const MOCK_USER_ID = 1;
const MOCK_ADMIN_ID = 99;
const MOCK_PROJECT_ID = 1;
const MOCK_FILE = { path: 'file.pdf' };
const MOCK_NEW_FILE = { path: 'new.pdf' };
const MOCK_CREATE_DTO: CreateFinalProjectDto = {
  title: 'Judul',
  description: 'Deskripsi',
};
const MOCK_UPDATE_DTO: UpdateFinalProjectDto = {
  title: 'Baru',
};
const MOCK_REVIEW_DTO: ReviewFinalProjectDto = {
  status: 'accepted',
  grade: 90,
  feedback: 'Bagus',
};
const MOCK_QUERY = { page: 1, limit: 10 };

describe('FinalProjectsController', () => {
  /**
   * Deklarasi variabel controller dan service mock.
   */
  let controller: FinalProjectsController;
  let service: Record<string, jest.Mock>;

  /**
   * Setup sebelum setiap pengujian.
   * Membuat mock service dan menginisialisasi controller.
   */
  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAllForUser: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      review: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinalProjectsController],
      providers: [{ provide: FinalProjectsService, useValue: service }],
    }).compile();

    controller = module.get<FinalProjectsController>(FinalProjectsController);
  });

  /**
   * Pengujian endpoint create
   * -----------------------------------------------
   * Menguji proses pembuatan final project baru.
   */
  describe('create', () => {
    /**
     * Menguji keberhasilan pembuatan final project.
     * Pastikan service dipanggil dengan parameter yang benar.
     */
    it('berhasil membuat final project', async () => {
      /**
       * Tujuan: Memastikan endpoint create dapat membuat final project baru
       * dan mengembalikan data yang sesuai.
       */
      const req = { user: { userId: MOCK_USER_ID } };
      service.create.mockResolvedValue({
        id: MOCK_PROJECT_ID,
        title: MOCK_CREATE_DTO.title,
      });

      const result = await controller.create(
        req as any,
        MOCK_CREATE_DTO,
        MOCK_FILE as any,
      );

      expect(result).toEqual({
        id: MOCK_PROJECT_ID,
        title: MOCK_CREATE_DTO.title,
      });
      expect(service.create).toBeCalledWith(
        MOCK_USER_ID,
        MOCK_CREATE_DTO,
        MOCK_FILE,
      );
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: MOCK_USER_ID } };
      service.create.mockRejectedValue(new Error('error'));

      await expect(
        controller.create(req as any, MOCK_CREATE_DTO, undefined),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findAllForUser
   * -----------------------------------------------
   * Menguji pengambilan seluruh final project milik user tertentu.
   */
  describe('findAllForUser', () => {
    /**
     * Menguji keberhasilan pengambilan seluruh final project user.
     */
    it('berhasil mengambil seluruh final project milik user', async () => {
      /**
       * Tujuan: Memastikan user dapat mengambil seluruh final project miliknya.
       */
      const req = { user: { userId: MOCK_USER_ID } };
      const mockProjects = [{ id: 1 }, { id: 2 }];
      service.findAllForUser.mockResolvedValue(mockProjects);

      const result = await controller.findAllForUser(req as any);

      expect(result).toEqual(mockProjects);
      expect(service.findAllForUser).toBeCalledWith(MOCK_USER_ID);
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: MOCK_USER_ID } };
      service.findAllForUser.mockRejectedValue(new Error('error'));

      await expect(controller.findAllForUser(req as any)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint findAllForAdmin
   * -----------------------------------------------
   * Menguji pengambilan seluruh final project untuk admin (dengan pagination).
   */
  describe('findAllForAdmin', () => {
    /**
     * Menguji keberhasilan pengambilan seluruh final project untuk admin.
     */
    it('berhasil mengambil seluruh final project untuk admin', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengambil seluruh final project dengan pagination.
       */
      const mockResult = {
        data: [{ id: MOCK_PROJECT_ID }],
        total: 1,
        page: 1,
        lastPage: 1,
      };
      service.findAllForAdmin.mockResolvedValue(mockResult);

      const result = await controller.findAllForAdmin(MOCK_QUERY as any);

      expect(result).toEqual(mockResult);
      expect(service.findAllForAdmin).toBeCalledWith(
        MOCK_QUERY.page,
        MOCK_QUERY.limit,
      );
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      service.findAllForAdmin.mockRejectedValue(new Error('error'));

      await expect(
        controller.findAllForAdmin(MOCK_QUERY as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findOne
   * -----------------------------------------------
   * Menguji pengambilan detail final project berdasarkan id.
   */
  describe('findOne', () => {
    /**
     * Menguji pengambilan detail final project oleh user intern.
     */
    it('berhasil mengambil detail final project (intern)', async () => {
      /**
       * Tujuan: Memastikan user intern dapat mengambil detail final project miliknya.
       */
      const req = { user: { userId: 2, role: 'Intern' } };
      const mockProject = { id: MOCK_PROJECT_ID, userId: 2 };
      service.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne(MOCK_PROJECT_ID, req as any);

      expect(result).toEqual(mockProject);
      expect(service.findOne).toBeCalledWith(MOCK_PROJECT_ID, 2);
    });

    /**
     * Menguji pengambilan detail final project oleh admin.
     */
    it('berhasil mengambil detail final project (admin)', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengambil detail final project siapapun.
       */
      const req = { user: { userId: MOCK_ADMIN_ID, role: 'Admin' } };
      const mockProject = { id: MOCK_PROJECT_ID, userId: 2 };
      service.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne(MOCK_PROJECT_ID, req as any);

      expect(result).toEqual(mockProject);
      expect(service.findOne).toBeCalledWith(MOCK_PROJECT_ID, undefined);
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 2, role: 'Intern' } };
      service.findOne.mockRejectedValue(new Error('error'));

      await expect(
        controller.findOne(MOCK_PROJECT_ID, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint update
   * -----------------------------------------------
   * Menguji proses update final project.
   */
  describe('update', () => {
    /**
     * Menguji keberhasilan update final project.
     */
    it('berhasil update final project', async () => {
      /**
       * Tujuan: Memastikan user dapat mengupdate final project miliknya.
       */
      const req = { user: { userId: 2 } };
      service.update.mockResolvedValue({
        id: MOCK_PROJECT_ID,
        title: MOCK_UPDATE_DTO.title,
      });

      const result = await controller.update(
        MOCK_PROJECT_ID,
        req as any,
        MOCK_UPDATE_DTO,
        MOCK_NEW_FILE as any,
      );

      expect(result).toEqual({
        id: MOCK_PROJECT_ID,
        title: MOCK_UPDATE_DTO.title,
      });
      expect(service.update).toBeCalledWith(
        MOCK_PROJECT_ID,
        2,
        MOCK_UPDATE_DTO,
        MOCK_NEW_FILE,
      );
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 2 } };
      service.update.mockRejectedValue(new Error('error'));

      await expect(
        controller.update(
          MOCK_PROJECT_ID,
          req as any,
          MOCK_UPDATE_DTO,
          undefined,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint review
   * -----------------------------------------------
   * Menguji proses review final project oleh admin/pembimbing.
   */
  describe('review', () => {
    /**
     * Menguji keberhasilan review final project.
     */
    it('berhasil review final project', async () => {
      /**
       * Tujuan: Memastikan admin/pembimbing dapat melakukan review final project.
       */
      const req = { user: { userId: MOCK_ADMIN_ID } };
      service.review.mockResolvedValue({
        id: MOCK_PROJECT_ID,
        status: MOCK_REVIEW_DTO.status,
      });

      const result = await controller.review(
        MOCK_PROJECT_ID,
        req as any,
        MOCK_REVIEW_DTO,
      );

      expect(result).toEqual({
        id: MOCK_PROJECT_ID,
        status: MOCK_REVIEW_DTO.status,
      });
      expect(service.review).toBeCalledWith(
        MOCK_PROJECT_ID,
        MOCK_ADMIN_ID,
        MOCK_REVIEW_DTO,
      );
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: MOCK_ADMIN_ID } };
      service.review.mockRejectedValue(new Error('error'));

      await expect(
        controller.review(MOCK_PROJECT_ID, req as any, MOCK_REVIEW_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint remove
   * -----------------------------------------------
   * Menguji proses penghapusan final project.
   */
  describe('remove', () => {
    /**
     * Menguji keberhasilan penghapusan final project.
     */
    it('berhasil menghapus final project', async () => {
      /**
       * Tujuan: Memastikan user dapat menghapus final project miliknya.
       */
      const req = { user: { userId: 2 } };
      service.remove.mockResolvedValue({ id: MOCK_PROJECT_ID });

      const result = await controller.remove(MOCK_PROJECT_ID, req as any);

      expect(result).toEqual({ id: MOCK_PROJECT_ID });
      expect(service.remove).toBeCalledWith(MOCK_PROJECT_ID, 2);
    });

    /**
     * Menguji kegagalan jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 2 } };
      service.remove.mockRejectedValue(new Error('error'));

      await expect(
        controller.remove(MOCK_PROJECT_ID, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint download
   * -----------------------------------------------
   * Menguji proses pengunduhan file final project.
   */
  describe('download', () => {
    it('berhasil download file final project sebagai admin', async () => {
      const req = { user: { userId: MOCK_ADMIN_ID, role: 'Admin' } };
      const res = {
        setHeader: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      } as any;
      service.download = jest.fn().mockResolvedValue(undefined);

      await expect(
        controller.download(MOCK_PROJECT_ID, req as any, res),
      ).resolves.toBeUndefined();

      expect(service.download).toBeCalledWith(
        MOCK_PROJECT_ID,
        undefined, // admin
        res,
      );
    });

    it('berhasil download file final project sebagai intern', async () => {
      const req = { user: { userId: MOCK_USER_ID, role: 'Intern' } };
      const res = {
        setHeader: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      } as any;
      service.download = jest.fn().mockResolvedValue(undefined);

      await expect(
        controller.download(MOCK_PROJECT_ID, req as any, res),
      ).resolves.toBeUndefined();

      expect(service.download).toBeCalledWith(
        MOCK_PROJECT_ID,
        MOCK_USER_ID,
        res,
      );
    });

    it('gagal download jika service error', async () => {
      const req = { user: { userId: MOCK_USER_ID, role: 'Intern' } };
      const res = {
        setHeader: jest.fn(),
        end: jest.fn(),
        pipe: jest.fn(),
      } as any;
      service.download = jest.fn().mockRejectedValue(new Error('error'));

      await expect(
        controller.download(MOCK_PROJECT_ID, req as any, res),
      ).rejects.toThrow('error');
    });
  });
});
