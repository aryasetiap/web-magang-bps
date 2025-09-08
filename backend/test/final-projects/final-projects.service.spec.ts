/**
 * Unit Test FinalProjectsService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama FinalProjectsService, termasuk create, findAllForUser,
 * findAllForAdmin, findOne, update, review, dan remove.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { FinalProjectsService } from '../../src/final-projects/final-projects.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateFinalProjectDto } from '../../src/final-projects/dto/create-final-project.dto';
import { UpdateFinalProjectDto } from '../../src/final-projects/dto/update-final-project.dto';
import { ReviewFinalProjectDto } from '../../src/final-projects/dto/review-final-project.dto';

jest.mock('fs');

// Konstanta untuk data dummy yang sering digunakan
const USER_ID = 1;
const ADMIN_ID = 99;
const PROJECT_ID = 1;
const FILE_OLD = 'old.pdf';
const FILE_NEW = 'new.pdf';
const FILE_PATH = 'file.pdf';
const FINAL_PROJECT_DTO: CreateFinalProjectDto = {
  title: 'Judul',
  description: 'Deskripsi',
};
const UPDATE_PROJECT_DTO: UpdateFinalProjectDto = {
  title: 'Baru',
};
const REVIEW_DTO: ReviewFinalProjectDto = {
  status: 'accepted',
  grade: 90,
  feedback: 'Bagus',
};

describe('FinalProjectsService', () => {
  /**
   * Inisialisasi service dan mock dependency sebelum setiap pengujian.
   */
  let service: FinalProjectsService;
  let prisma: any;
  let fsMock: any;

  beforeEach(() => {
    prisma = {
      finalProject: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };
    fsMock = require('fs');
    fsMock.existsSync = jest.fn();
    fsMock.unlinkSync = jest.fn();

    service = new FinalProjectsService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Pengujian fitur create pada FinalProjectsService.
   * Menguji pembuatan final project baik dengan maupun tanpa file.
   */
  describe('create', () => {
    /**
     * Menguji pembuatan final project tanpa file.
     * Diharapkan data berhasil disimpan dengan status 'draft'.
     */
    it('berhasil membuat final project tanpa file', async () => {
      prisma.finalProject.create.mockResolvedValue({
        id: PROJECT_ID,
        title: FINAL_PROJECT_DTO.title,
      });

      const result = await service.create(USER_ID, FINAL_PROJECT_DTO);

      expect(result).toHaveProperty('id', PROJECT_ID);
      expect(prisma.finalProject.create).toBeCalledWith({
        data: expect.objectContaining({
          title: FINAL_PROJECT_DTO.title,
          description: FINAL_PROJECT_DTO.description,
          userId: USER_ID,
          status: 'draft',
        }),
      });
    });

    /**
     * Menguji pembuatan final project dengan file.
     * Diharapkan data berhasil disimpan dengan status 'submitted' dan filePath sesuai.
     */
    it('berhasil membuat final project dengan file', async () => {
      const file = { path: FILE_PATH } as any;
      prisma.finalProject.create.mockResolvedValue({
        id: 2,
        title: FINAL_PROJECT_DTO.title,
        filePath: FILE_PATH,
      });

      const result = await service.create(USER_ID, FINAL_PROJECT_DTO, file);

      expect(result).toHaveProperty('id', 2);
      expect(prisma.finalProject.create).toBeCalledWith({
        data: expect.objectContaining({
          filePath: FILE_PATH,
          status: 'submitted',
        }),
      });
    });
  });

  /**
   * Pengujian fitur findAllForUser pada FinalProjectsService.
   * Menguji pengambilan seluruh final project milik user tertentu.
   */
  describe('findAllForUser', () => {
    /**
     * Menguji pengambilan daftar final project milik user.
     * Diharapkan mengembalikan array data final project.
     */
    it('mengembalikan daftar final project milik user', async () => {
      prisma.finalProject.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAllForUser(USER_ID);
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.finalProject.findMany).toBeCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  /**
   * Pengujian fitur findAllForAdmin pada FinalProjectsService.
   * Menguji pengambilan seluruh final project beserta paginasi untuk admin.
   */
  describe('findAllForAdmin', () => {
    /**
     * Menguji pengambilan data dan paginasi final project untuk admin.
     * Diharapkan mengembalikan data, total, page, dan lastPage.
     */
    it('mengembalikan data dan paginasi final project', async () => {
      prisma.finalProject.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.finalProject.count.mockResolvedValue(1);

      const result = await service.findAllForAdmin(1, 10);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('lastPage', 1);
      expect(prisma.finalProject.findMany).toBeCalled();
      expect(prisma.finalProject.count).toBeCalled();
    });
  });

  /**
   * Pengujian fitur findOne pada FinalProjectsService.
   * Menguji pengambilan detail final project berdasarkan id dan user.
   */
  describe('findOne', () => {
    /**
     * Menguji pengambilan detail final project jika ditemukan dan userId cocok.
     * Diharapkan data final project dikembalikan.
     */
    it('mengembalikan detail final project jika ditemukan dan userId cocok', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 2,
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });

      const result = await service.findOne(PROJECT_ID, 2);

      expect(result).toHaveProperty('id', PROJECT_ID);
      expect(prisma.finalProject.findUnique).toBeCalledWith({
        where: { id: PROJECT_ID },
        include: {
          user: { select: { id: true, name: true, email: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
      });
    });

    /**
     * Menguji pengambilan detail final project jika ditemukan dan user adalah admin.
     * Diharapkan data final project dikembalikan.
     */
    it('mengembalikan detail final project jika ditemukan dan user admin', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 2,
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });

      const result = await service.findOne(PROJECT_ID);

      expect(result).toHaveProperty('id', PROJECT_ID);
    });

    /**
     * Menguji jika final project tidak ditemukan.
     * Diharapkan melempar NotFoundException.
     */
    it('melempar NotFoundException jika tidak ditemukan', async () => {
      prisma.finalProject.findUnique.mockResolvedValue(null);

      await expect(service.findOne(PROJECT_ID, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * Menguji jika userId tidak cocok dengan pemilik final project.
     * Diharapkan melempar ForbiddenException.
     */
    it('melempar ForbiddenException jika userId tidak cocok', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 3,
        user: { id: 3, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });

      await expect(service.findOne(PROJECT_ID, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /**
   * Pengujian fitur update pada FinalProjectsService.
   * Menguji update data final project baik dengan maupun tanpa file.
   */
  describe('update', () => {
    /**
     * Menguji update final project tanpa file baru.
     * Diharapkan data berhasil diupdate.
     */
    it('berhasil update final project tanpa file', async () => {
      const project = { id: PROJECT_ID, userId: 2, filePath: null };
      prisma.finalProject.findUnique.mockResolvedValue(project);
      prisma.finalProject.update.mockResolvedValue({
        id: PROJECT_ID,
        title: UPDATE_PROJECT_DTO.title,
      });

      const result = await service.update(PROJECT_ID, 2, UPDATE_PROJECT_DTO);

      expect(result).toHaveProperty('id', PROJECT_ID);
      expect(prisma.finalProject.update).toBeCalledWith({
        where: { id: PROJECT_ID },
        data: expect.objectContaining({ title: UPDATE_PROJECT_DTO.title }),
      });
    });

    /**
     * Menguji update final project dengan file baru.
     * Diharapkan file lama dihapus dan data diupdate dengan file baru.
     */
    it('berhasil update final project dengan file baru', async () => {
      const project = { id: PROJECT_ID, userId: 2, filePath: FILE_OLD };
      prisma.finalProject.findUnique.mockResolvedValue(project);
      fsMock.existsSync.mockReturnValue(true);
      const file = { path: FILE_NEW } as any;
      prisma.finalProject.update.mockResolvedValue({
        id: PROJECT_ID,
        filePath: FILE_NEW,
      });

      const result = await service.update(
        PROJECT_ID,
        2,
        UPDATE_PROJECT_DTO,
        file,
      );

      expect(fsMock.unlinkSync).toBeCalledWith(FILE_OLD);
      expect(result).toHaveProperty('filePath', FILE_NEW);
      expect(prisma.finalProject.update).toBeCalledWith({
        where: { id: PROJECT_ID },
        data: expect.objectContaining({
          filePath: FILE_NEW,
          status: 'submitted',
        }),
      });
    });
  });

  /**
   * Pengujian fitur review pada FinalProjectsService.
   * Menguji proses review final project oleh admin.
   */
  describe('review', () => {
    /**
     * Menguji review final project jika status 'submitted'.
     * Diharapkan status, grade, feedback, dan reviewedById terupdate.
     */
    it('berhasil review jika status submitted', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        status: 'submitted',
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });
      prisma.finalProject.update.mockResolvedValue({
        id: PROJECT_ID,
        status: 'accepted',
      });

      const result = await service.review(PROJECT_ID, ADMIN_ID, REVIEW_DTO);

      expect(result).toHaveProperty('status', 'accepted');
      expect(prisma.finalProject.update).toBeCalledWith({
        where: { id: PROJECT_ID },
        data: expect.objectContaining({
          status: 'accepted',
          grade: 90,
          feedback: 'Bagus',
          reviewedById: ADMIN_ID,
        }),
      });
    });

    /**
     * Menguji review final project jika status bukan 'submitted'.
     * Diharapkan melempar ForbiddenException.
     */
    it('melempar ForbiddenException jika status bukan submitted', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        status: 'draft',
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });

      await expect(
        service.review(PROJECT_ID, ADMIN_ID, REVIEW_DTO),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  /**
   * Pengujian fitur remove pada FinalProjectsService.
   * Menguji proses penghapusan final project beserta file jika ada.
   */
  describe('remove', () => {
    /**
     * Menguji penghapusan final project beserta file jika file ada.
     * Diharapkan file dihapus dan data final project terhapus.
     */
    it('berhasil menghapus final project beserta file', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 2,
        filePath: FILE_PATH,
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });
      fsMock.existsSync.mockReturnValue(true);
      prisma.finalProject.delete.mockResolvedValue({ id: PROJECT_ID });

      const result = await service.remove(PROJECT_ID, 2);

      expect(fsMock.unlinkSync).toBeCalledWith(FILE_PATH);
      expect(result).toHaveProperty('id', PROJECT_ID);
      expect(prisma.finalProject.delete).toBeCalledWith({
        where: { id: PROJECT_ID },
      });
    });

    /**
     * Menguji penghapusan final project tanpa file.
     * Diharapkan hanya data final project yang dihapus.
     */
    it('berhasil menghapus final project tanpa file', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 2,
        filePath: null,
        user: { id: 2, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });
      fsMock.existsSync.mockReturnValue(false);
      prisma.finalProject.delete.mockResolvedValue({ id: PROJECT_ID });

      const result = await service.remove(PROJECT_ID, 2);

      expect(fsMock.unlinkSync).not.toBeCalled();
      expect(result).toHaveProperty('id', PROJECT_ID);
      expect(prisma.finalProject.delete).toBeCalledWith({
        where: { id: PROJECT_ID },
      });
    });

    /**
     * Menguji penghapusan final project yang tidak ditemukan.
     * Diharapkan melempar NotFoundException.
     */
    it('melempar NotFoundException jika final project tidak ditemukan', async () => {
      prisma.finalProject.findUnique.mockResolvedValue(null);

      await expect(service.remove(PROJECT_ID, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    /**
     * Menguji penghapusan final project jika userId tidak cocok.
     * Diharapkan melempar ForbiddenException.
     */
    it('melempar ForbiddenException jika userId tidak cocok', async () => {
      prisma.finalProject.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        userId: 3,
        filePath: null,
        user: { id: 3, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      });

      await expect(service.remove(PROJECT_ID, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /**
   * Pengujian fitur download pada FinalProjectsService.
   * Menguji proses pengunduhan file final project.
   */
  describe('download', () => {
    it('gagal jika file tidak ditemukan', async () => {
      // Mock project ditemukan, tapi filePath null
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: PROJECT_ID,
        filePath: null,
        userId: USER_ID,
        user: { id: USER_ID, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      } as any);

      const res = { setHeader: jest.fn() } as any;
      await expect(service.download(PROJECT_ID, USER_ID, res)).rejects.toThrow(
        'File final project tidak ditemukan',
      );
    });

    it('gagal jika filePath ada tapi file tidak ada di disk', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: PROJECT_ID,
        filePath: FILE_PATH,
        userId: USER_ID,
        user: { id: USER_ID, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      } as any);
      jest.spyOn(fsMock, 'existsSync').mockReturnValue(false);

      const res = { setHeader: jest.fn() } as any;
      await expect(service.download(PROJECT_ID, USER_ID, res)).rejects.toThrow(
        'File final project tidak ditemukan',
      );
    });

    it('berhasil download jika file ada', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: PROJECT_ID,
        filePath: FILE_PATH,
        userId: USER_ID,
        user: { id: USER_ID, name: 'Budi', email: 'budi@mail.com' },
        reviewedBy: null,
      } as any);
      jest.spyOn(fsMock, 'existsSync').mockReturnValue(true);
      const mockStream = { pipe: jest.fn() };
      jest.spyOn(fsMock, 'createReadStream').mockReturnValue(mockStream as any);

      const res = { setHeader: jest.fn() } as any;
      await service.download(PROJECT_ID, USER_ID, res);

      expect(res.setHeader).toBeCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toBeCalledWith(
        'Content-Disposition',
        expect.stringContaining(`final-project-${PROJECT_ID}.pdf`),
      );
      expect(mockStream.pipe).toBeCalledWith(res);
    });
  });
});
