/**
 * Unit Test TasksService
 * -------------------------------------------------
 * Pengujian seluruh fitur utama TasksService, termasuk create, assignTask,
 * submitTask, findSubmissionsForTask, gradeSubmission, findTasksForUser,
 * findAll, findOne, update, remove, dan isUserAssignedToTask.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { TasksService } from '../../src/tasks/tasks.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../src/tasks/dto/update-task.dto';
import { AssignTaskDto } from '../../src/tasks/dto/assign-task.dto';
import { GradeSubmissionDto } from '../../src/submissions/dto/grade-submission.dto';

jest.mock('fs');

describe('TasksService', () => {
  let service: TasksService;
  let prisma: any;
  let fsMock: any;

  beforeEach(() => {
    prisma = {
      task: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      taskAssignment: {
        createMany: jest.fn(),
        findUnique: jest.fn(),
      },
      submission: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    };
    fsMock = require('fs');
    fsMock.unlinkSync = jest.fn();

    service = new TasksService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Pengujian create tugas baru.
   */
  describe('create', () => {
    it('berhasil membuat tugas baru tanpa intern', async () => {
      const dto: CreateTaskDto = {
        title: 'Tugas 1',
        description: 'Deskripsi',
        deadline: '2025-07-01',
      };
      prisma.task.create.mockResolvedValue({ id: 1, ...dto });
      prisma.auditLog.create.mockResolvedValue({});

      const result = await service.create(99, dto);

      expect(result).toHaveProperty('id', 1);
      expect(prisma.task.create).toBeCalled();
      expect(prisma.auditLog.create).toBeCalled();
    });

    it('berhasil membuat tugas baru dan assign ke intern', async () => {
      const dto: CreateTaskDto = {
        title: 'Tugas 2',
        description: 'Deskripsi',
        deadline: '2025-07-01',
        internIds: [2, 3],
      };
      prisma.task.create.mockResolvedValue({ id: 2, ...dto });
      prisma.taskAssignment.createMany.mockResolvedValue({});
      prisma.auditLog.create.mockResolvedValue({});

      const result = await service.create(99, dto);

      expect(prisma.taskAssignment.createMany).toBeCalledWith({
        data: [
          { taskId: 2, userId: 2 },
          { taskId: 2, userId: 3 },
        ],
        skipDuplicates: true,
      });
      expect(result).toHaveProperty('id', 2);
    });
  });

  /**
   * Pengujian assignTask.
   */
  describe('assignTask', () => {
    it('berhasil assign tugas ke intern', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 1 });
      prisma.taskAssignment.createMany.mockResolvedValue({ count: 2 });

      const dto: AssignTaskDto = { internIds: [2, 3] };
      const result = await service.assignTask(1, dto);

      expect(result).toHaveProperty('count', 2);
      expect(prisma.taskAssignment.createMany).toBeCalled();
    });

    it('gagal assign jika tugas tidak ditemukan', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      const dto: AssignTaskDto = { internIds: [2] };
      await expect(service.assignTask(1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian submitTask.
   */
  describe('submitTask', () => {
    const file = { path: 'file.pdf', mimetype: 'application/pdf', size: 1000 };
    it('berhasil submit tugas dengan file', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 2,
      });
      prisma.submission.findFirst.mockResolvedValue(null);
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deadline: new Date(Date.now() + 10000),
      });
      prisma.submission.create.mockResolvedValue({
        id: 1,
        filePath: 'file.pdf',
      });

      const result = await service.submitTask(2, 1, file as any, 'desc');

      expect(result).toHaveProperty('id', 1);
      expect(prisma.submission.create).toBeCalled();
    });

    it('berhasil submit tugas tanpa file (hanya deskripsi)', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 2,
      });
      prisma.submission.findFirst.mockResolvedValue(null);
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deadline: new Date(Date.now() + 10000),
      });
      prisma.submission.create.mockResolvedValue({ id: 2, filePath: null });

      const result = await service.submitTask(2, 1, undefined as any, 'desc');

      expect(result).toHaveProperty('id', 2);
      expect(prisma.submission.create).toBeCalled();
    });

    it('gagal jika file dan deskripsi kosong', async () => {
      await expect(
        service.submitTask(2, 1, undefined as any, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika file tidak valid', async () => {
      const invalidFile = { ...file, mimetype: 'image/png' };
      await expect(
        service.submitTask(2, 1, invalidFile as any, 'desc'),
      ).rejects.toThrow(BadRequestException);
      expect(fsMock.unlinkSync).toBeCalledWith(invalidFile.path);
    });

    it('gagal jika user tidak diassign', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue(null);
      const file2 = { ...file };
      await expect(
        service.submitTask(2, 1, file2 as any, 'desc'),
      ).rejects.toThrow(ForbiddenException);
      expect(fsMock.unlinkSync).toBeCalledWith(file2.path);
    });

    it('gagal jika sudah pernah submit', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 2,
      });
      prisma.submission.findFirst.mockResolvedValue({ id: 1 });
      const file2 = { ...file };
      await expect(
        service.submitTask(2, 1, file2 as any, 'desc'),
      ).rejects.toThrow(ConflictException);
      expect(fsMock.unlinkSync).toBeCalledWith(file2.path);
    });
  });

  /**
   * Pengujian findSubmissionsForTask.
   */
  describe('findSubmissionsForTask', () => {
    it('berhasil mengambil seluruh submission untuk tugas', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 1 });
      prisma.submission.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await service.findSubmissionsForTask(1);

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.submission.findMany).toBeCalledWith({
        where: { taskId: 1 },
        include: {
          user: {
            select: {
              name: true,
              namaLengkap: true,
            },
          },
        },
      });
    });

    it('gagal jika tugas tidak ditemukan', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(service.findSubmissionsForTask(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * Pengujian gradeSubmission.
   */
  describe('gradeSubmission', () => {
    it('berhasil memberikan revisi pada submission', async () => {
      prisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 99 },
        status: 'submitted',
        userId: 2,
      });
      prisma.submission.update.mockResolvedValue({
        id: 1,
        status: 'revisi',
        userId: 2,
      });
      prisma.notification.create.mockResolvedValue({});

      const dto: GradeSubmissionDto = {
        status: 'revisi',
        feedback: 'Perbaiki',
        grade: 0,
      };
      const result = await service.gradeSubmission(1, dto, 99);

      expect(result).toHaveProperty('status', 'revisi');
      expect(prisma.submission.update).toBeCalled();
      expect(prisma.notification.create).toBeCalled();
    });

    it('berhasil memberikan nilai pada submission', async () => {
      prisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 99 },
        status: 'submitted',
        userId: 2,
      });
      prisma.submission.update.mockResolvedValue({
        id: 1,
        status: 'reviewed',
        userId: 2,
      });
      prisma.notification.create.mockResolvedValue({});
      prisma.auditLog.create.mockResolvedValue({});

      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      const result = await service.gradeSubmission(1, dto, 99);

      expect(result).toHaveProperty('status', 'reviewed');
      expect(prisma.submission.update).toBeCalled();
      expect(prisma.notification.create).toBeCalled();
      expect(prisma.auditLog.create).toBeCalled();
    });

    it('gagal jika submission tidak ditemukan', async () => {
      prisma.submission.findUnique.mockResolvedValue(null);
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(service.gradeSubmission(1, dto, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('gagal jika grader bukan pembuat tugas', async () => {
      prisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 88 },
        status: 'submitted',
        userId: 2,
      });
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(service.gradeSubmission(1, dto, 99)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('gagal jika status submission tidak bisa dinilai', async () => {
      prisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 99 },
        status: 'draft',
        userId: 2,
      });
      const dto: GradeSubmissionDto = {
        status: 'reviewed',
        feedback: 'Bagus',
        grade: 90,
      };
      await expect(service.gradeSubmission(1, dto, 99)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian findTasksForUser.
   */
  describe('findTasksForUser', () => {
    it('berhasil mengambil daftar tugas yang diassign ke user', async () => {
      prisma.task.findMany.mockResolvedValue([
        {
          id: 1,
          filePath: 'uploads/tasks/file.pdf',
          submissions: [
            {
              id: 2,
              status: 'submitted',
              grade: 90,
              feedback: 'ok',
              isLate: false,
            },
          ],
        },
      ]);
      const result = await service.findTasksForUser(2, 1, 10);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('fileUrl');
      expect(result[0]).toHaveProperty('submission');
      expect(prisma.task.findMany).toBeCalled();
    });
  });

  /**
   * Pengujian findAll.
   */
  describe('findAll', () => {
    it('berhasil mengambil seluruh tugas', async () => {
      prisma.task.findMany.mockResolvedValue([
        { id: 1, filePath: 'uploads/tasks/file.pdf' },
      ]);
      const result = await service.findAll();
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toHaveProperty('fileUrl');
      expect(prisma.task.findMany).toBeCalled();
    });
  });

  /**
   * Pengujian findOne.
   */
  describe('findOne', () => {
    it('berhasil mengambil detail tugas', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        filePath: 'uploads/tasks/file.pdf',
        deletedAt: null,
      });
      const result = await service.findOne(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('fileUrl');
      expect(prisma.task.findUnique).toBeCalled();
    });

    it('gagal jika tugas tidak ditemukan', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('gagal jika tugas sudah dihapus', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian update.
   */
  describe('update', () => {
    it('berhasil update tugas jika belum deadline', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deletedAt: null,
        deadline: new Date(Date.now() + 10000),
      });
      prisma.task.update.mockResolvedValue({
        id: 1,
        title: 'Baru',
        createdBy: 99,
      });
      prisma.auditLog.create.mockResolvedValue({});

      const dto: UpdateTaskDto = { title: 'Baru' };
      const result = await service.update(1, dto);

      expect(result).toHaveProperty('title', 'Baru');
      expect(prisma.task.update).toBeCalled();
      expect(prisma.auditLog.create).toBeCalled();
    });

    it('gagal jika tugas tidak ditemukan', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      const dto: UpdateTaskDto = { title: 'Baru' };
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('gagal jika tugas sudah dihapus', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deadline: new Date(Date.now() + 10000),
      });
      const dto: UpdateTaskDto = { title: 'Baru' };
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('gagal jika sudah lewat deadline', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 1,
        deletedAt: null,
        deadline: new Date(Date.now() - 10000),
      });
      const dto: UpdateTaskDto = { title: 'Baru' };
      await expect(service.update(1, dto)).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Pengujian remove.
   */
  describe('remove', () => {
    it('berhasil soft delete tugas', async () => {
      prisma.task.update.mockResolvedValue({
        id: 1,
        title: 'Tugas',
        createdBy: 99,
      });
      prisma.auditLog.create.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result).toHaveProperty('id', 1);
      expect(prisma.task.update).toBeCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
      expect(prisma.auditLog.create).toBeCalled();
    });
  });

  /**
   * Pengujian isUserAssignedToTask.
   */
  describe('isUserAssignedToTask', () => {
    it('mengembalikan true jika user sudah diassign', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 2,
      });
      const result = await service.isUserAssignedToTask(1, 2);
      expect(result).toBe(true);
    });

    it('mengembalikan false jika user belum diassign', async () => {
      prisma.taskAssignment.findUnique.mockResolvedValue(null);
      const result = await service.isUserAssignedToTask(1, 2);
      expect(result).toBe(false);
    });
  });
});
