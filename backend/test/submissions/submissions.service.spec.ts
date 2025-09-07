/**
 * Unit Test SubmissionsService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama SubmissionsService, termasuk resubmit, submit, dan grade.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { SubmissionsService } from '../../src/submissions/submissions.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GradeSubmissionDto } from '../../src/submissions/dto/grade-submission.dto';

jest.mock('fs');

/**
 * Konstanta dummy untuk file yang digunakan pada pengujian.
 */
const DUMMY_FILE = {
  path: 'file.pdf',
  mimetype: 'application/pdf',
  size: 1000,
  originalname: 'file.pdf',
};

/**
 * Konstanta untuk ID yang sering digunakan pada pengujian.
 */
const USER_ID = 2;
const TASK_ID = 10;
const SUBMISSION_ID = 1;
const CREATOR_ID = 99;

describe('SubmissionsService', () => {
  /**
   * Service dan dependency yang akan di-mock pada setiap pengujian.
   */
  let service: SubmissionsService;
  let prisma: any;
  let fsMock: any;

  beforeEach(() => {
    /**
     * Setup mock Prisma dan fs sebelum setiap pengujian.
     */
    prisma = {
      submission: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
      },
      taskAssignment: {
        findUnique: jest.fn(),
      },
    };
    fsMock = require('fs');
    fsMock.existsSync = jest.fn();
    fsMock.unlinkSync = jest.fn();

    service = new SubmissionsService(prisma);
  });

  afterEach(() => {
    /**
     * Membersihkan seluruh mock setelah setiap pengujian.
     */
    jest.clearAllMocks();
  });

  /**
   * Pengujian fitur resubmit submission.
   * ------------------------------------
   * Menguji berbagai skenario pada proses resubmit, baik yang berhasil maupun gagal.
   */
  describe('resubmit', () => {
    it('berhasil resubmit dengan file baru', async () => {
      /**
       * Menguji resubmit dengan file baru dan deskripsi baru.
       * Diharapkan file lama dihapus dan data submission terupdate.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: USER_ID,
        status: 'revisi',
        filePath: 'old.pdf',
        taskId: TASK_ID,
        description: 'lama',
      });
      prisma.task.findUnique.mockResolvedValue({
        id: TASK_ID,
        deadline: new Date(Date.now() + 10000),
      });
      fsMock.existsSync.mockReturnValue(true);
      const updatedSubmission = {
        id: SUBMISSION_ID,
        filePath: DUMMY_FILE.path,
        status: 'submitted',
      };
      prisma.submission.update.mockResolvedValue(updatedSubmission);

      const result = await service.resubmit(
        SUBMISSION_ID,
        USER_ID,
        DUMMY_FILE as any,
        'desc',
      );

      expect(fsMock.unlinkSync).toBeCalledWith('old.pdf');
      expect(prisma.submission.update).toBeCalledWith({
        where: { id: SUBMISSION_ID },
        data: expect.objectContaining({
          filePath: DUMMY_FILE.path,
          status: 'submitted',
          grade: null,
          feedback: null,
          isLate: false,
          description: 'desc',
        }),
      });
      expect(result).toEqual(updatedSubmission);
    });

    it('berhasil resubmit tanpa file baru (hanya deskripsi)', async () => {
      /**
       * Menguji resubmit hanya dengan perubahan deskripsi tanpa file baru.
       * File lama tetap digunakan.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: USER_ID,
        status: 'revisi',
        filePath: 'old.pdf',
        taskId: TASK_ID,
        description: 'lama',
      });
      prisma.task.findUnique.mockResolvedValue({
        id: TASK_ID,
        deadline: new Date(Date.now() + 10000),
      });
      const updatedSubmission = {
        id: SUBMISSION_ID,
        filePath: 'old.pdf',
        status: 'submitted',
      };
      prisma.submission.update.mockResolvedValue(updatedSubmission);

      const result = await service.resubmit(
        SUBMISSION_ID,
        USER_ID,
        undefined as any,
        'desc',
      );

      expect(prisma.submission.update).toBeCalledWith({
        where: { id: SUBMISSION_ID },
        data: expect.objectContaining({
          filePath: 'old.pdf',
          status: 'submitted',
          grade: null,
          feedback: null,
          isLate: false,
          description: 'desc',
        }),
      });
      expect(result).toEqual(updatedSubmission);
    });

    it('gagal jika file dan deskripsi kosong', async () => {
      /**
       * Menguji kegagalan resubmit jika file dan deskripsi sama-sama kosong.
       * Diharapkan melempar BadRequestException.
       */
      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, undefined as any, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika submission tidak ditemukan', async () => {
      /**
       * Menguji kegagalan resubmit jika submission tidak ditemukan.
       * Diharapkan melempar NotFoundException.
       */
      prisma.submission.findUnique.mockResolvedValue(null);
      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, undefined as any, 'desc'),
      ).rejects.toThrow(NotFoundException);
    });

    it('gagal jika user bukan pemilik submission', async () => {
      /**
       * Menguji kegagalan resubmit jika user bukan pemilik submission.
       * Diharapkan melempar ForbiddenException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: 999,
        status: 'revisi',
        taskId: TASK_ID,
      });
      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, undefined as any, 'desc'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gagal jika status submission tidak sesuai', async () => {
      /**
       * Menguji kegagalan resubmit jika status submission tidak "revisi".
       * Diharapkan melempar ForbiddenException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: USER_ID,
        status: 'draft',
        taskId: TASK_ID,
      });
      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, undefined as any, 'desc'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gagal jika status submission sudah reviewed', async () => {
      /**
       * Menguji kegagalan resubmit jika status submission sudah "reviewed".
       * Diharapkan melempar ForbiddenException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: USER_ID,
        status: 'reviewed',
        taskId: TASK_ID,
      });
      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, undefined as any, 'desc'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gagal jika file tidak valid', async () => {
      /**
       * Menguji kegagalan resubmit jika file yang diupload tidak valid (bukan PDF).
       * Diharapkan file dihapus dan melempar BadRequestException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        userId: USER_ID,
        status: 'revisi',
        filePath: 'old.pdf',
        taskId: TASK_ID,
        description: 'lama',
      });
      prisma.task.findUnique.mockResolvedValue({
        id: TASK_ID,
        deadline: new Date(Date.now() + 10000),
      });
      const invalidFile = { ...DUMMY_FILE, mimetype: 'image/png' };
      fsMock.existsSync.mockReturnValue(false);

      await expect(
        service.resubmit(SUBMISSION_ID, USER_ID, invalidFile as any, 'desc'),
      ).rejects.toThrow(BadRequestException);
      expect(fsMock.unlinkSync).toBeCalledWith(invalidFile.path);
    });
  });

  /**
   * Pengujian fitur submit tugas baru.
   * ---------------------------------
   * Menguji proses submit tugas baru, baik yang berhasil maupun gagal.
   */
  describe('submit', () => {
    it('berhasil submit tugas dengan file', async () => {
      /**
       * Menguji submit tugas baru dengan file PDF.
       * Diharapkan submission berhasil dibuat.
       */
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: USER_ID,
      });
      prisma.submission.findFirst.mockResolvedValue(null);
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deadline: new Date(Date.now() + 10000),
      });
      prisma.submission.create.mockResolvedValue({
        id: SUBMISSION_ID,
        filePath: DUMMY_FILE.path,
        status: 'submitted',
      });

      const result = await service.submit(
        1,
        USER_ID,
        DUMMY_FILE as any,
        'desc',
      );

      expect(prisma.submission.create).toBeCalledWith({
        data: expect.objectContaining({
          filePath: DUMMY_FILE.path,
          taskId: 1,
          userId: USER_ID,
          status: 'submitted',
          isLate: false,
          description: 'desc',
        }),
      });
      expect(result).toHaveProperty('id', SUBMISSION_ID);
    });

    it('berhasil submit tugas tanpa file (hanya deskripsi)', async () => {
      /**
       * Menguji submit tugas baru hanya dengan deskripsi tanpa file.
       * Submission tetap berhasil dibuat.
       */
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: USER_ID,
      });
      prisma.submission.findFirst.mockResolvedValue(null);
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deadline: new Date(Date.now() + 10000),
      });
      prisma.submission.create.mockResolvedValue({
        id: SUBMISSION_ID,
        filePath: null,
        status: 'submitted',
      });

      const result = await service.submit(1, USER_ID, undefined as any, 'desc');

      expect(prisma.submission.create).toBeCalledWith({
        data: expect.objectContaining({
          filePath: null,
          taskId: 1,
          userId: USER_ID,
          status: 'submitted',
          isLate: false,
          description: 'desc',
        }),
      });
      expect(result).toHaveProperty('id', SUBMISSION_ID);
    });

    it('gagal jika file dan deskripsi kosong', async () => {
      /**
       * Menguji kegagalan submit jika file dan deskripsi sama-sama kosong.
       * Diharapkan melempar BadRequestException.
       */
      await expect(
        service.submit(1, USER_ID, undefined as any, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika file tidak valid', async () => {
      /**
       * Menguji kegagalan submit jika file yang diupload tidak valid (bukan PDF).
       * Diharapkan file dihapus dan melempar BadRequestException.
       */
      const invalidFile = { ...DUMMY_FILE, mimetype: 'image/png' };
      await expect(
        service.submit(1, USER_ID, invalidFile as any, 'desc'),
      ).rejects.toThrow(BadRequestException);
      expect(fsMock.unlinkSync).toBeCalledWith(invalidFile.path);
    });

    it('gagal jika user tidak ditugaskan', async () => {
      /**
       * Menguji kegagalan submit jika user tidak ditugaskan pada tugas tersebut.
       * Diharapkan file dihapus dan melempar ForbiddenException.
       */
      prisma.taskAssignment.findUnique.mockResolvedValue(null);
      const file = { ...DUMMY_FILE };
      await expect(
        service.submit(1, USER_ID, file as any, 'desc'),
      ).rejects.toThrow(ForbiddenException);
      expect(fsMock.unlinkSync).toBeCalledWith(file.path);
    });

    it('gagal jika sudah pernah submit tugas', async () => {
      /**
       * Menguji kegagalan submit jika user sudah pernah submit tugas yang sama.
       * Diharapkan file dihapus dan melempar BadRequestException.
       */
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: USER_ID,
      });
      prisma.submission.findFirst.mockResolvedValue({ id: SUBMISSION_ID });
      const file = { ...DUMMY_FILE };
      await expect(
        service.submit(1, USER_ID, file as any, 'desc'),
      ).rejects.toThrow(BadRequestException);
      expect(fsMock.unlinkSync).toBeCalledWith(file.path);
    });
  });

  /**
   * Pengujian fitur grade submission.
   * --------------------------------
   * Menguji proses penilaian submission, baik status revisi maupun reviewed.
   */
  describe('grade', () => {
    it('berhasil grade submission status revisi', async () => {
      /**
       * Menguji proses grading submission dengan status "revisi".
       * Diharapkan feedback dan status terupdate.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        task: { createdBy: CREATOR_ID },
        status: 'submitted',
      });
      const dto: GradeSubmissionDto = {
        status: 'revisi',
        feedback: 'Perbaiki',
        grade: 0,
      };
      const updated = {
        id: SUBMISSION_ID,
        status: 'revisi',
        feedback: 'Perbaiki',
      };
      prisma.submission.update.mockResolvedValue(updated);

      const result = await service.grade(SUBMISSION_ID, dto, CREATOR_ID);

      expect(result).toEqual(updated);
      expect(prisma.submission.update).toBeCalledWith({
        where: { id: SUBMISSION_ID },
        data: expect.objectContaining({
          feedback: 'Perbaiki',
          status: 'revisi',
          gradedBy: CREATOR_ID,
        }),
      });
    });

    it('berhasil grade submission status reviewed', async () => {
      /**
       * Menguji proses grading submission dengan status "reviewed".
       * Diharapkan grade, feedback, dan status terupdate.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        task: { createdBy: CREATOR_ID },
        status: 'submitted',
      });
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      const updated = {
        id: SUBMISSION_ID,
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      prisma.submission.update.mockResolvedValue(updated);

      const result = await service.grade(SUBMISSION_ID, dto, CREATOR_ID);

      expect(result).toEqual(updated);
      expect(prisma.submission.update).toBeCalledWith({
        where: { id: SUBMISSION_ID },
        data: expect.objectContaining({
          grade: 90,
          feedback: 'Bagus',
          status: 'reviewed',
          gradedBy: CREATOR_ID,
        }),
      });
    });

    it('gagal jika submission tidak ditemukan', async () => {
      /**
       * Menguji kegagalan grading jika submission tidak ditemukan.
       * Diharapkan melempar NotFoundException.
       */
      prisma.submission.findUnique.mockResolvedValue(null);
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(
        service.grade(SUBMISSION_ID, dto, CREATOR_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('gagal jika grader bukan pembuat tugas', async () => {
      /**
       * Menguji kegagalan grading jika user yang melakukan grading bukan pembuat tugas.
       * Diharapkan melempar ForbiddenException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        task: { createdBy: 88 },
        status: 'submitted',
      });
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(
        service.grade(SUBMISSION_ID, dto, CREATOR_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gagal jika status submission tidak bisa dinilai', async () => {
      /**
       * Menguji kegagalan grading jika status submission tidak valid untuk dinilai.
       * Diharapkan melempar BadRequestException.
       */
      prisma.submission.findUnique.mockResolvedValue({
        id: SUBMISSION_ID,
        task: { createdBy: CREATOR_ID },
        status: 'draft',
      });
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(
        service.grade(SUBMISSION_ID, dto, CREATOR_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
