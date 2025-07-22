import * as fs from 'fs';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

// Mock Prisma untuk kebutuhan unit test
const mockPrisma = {
  task: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  taskAssignment: {
    createMany: jest.fn(),
    findUnique: jest.fn(),
  },
  submission: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let unlinkMock: jest.SpyInstance;

  /**
   * Melakukan mock pada fungsi unlinkSync dari modul fs sebelum seluruh pengujian dijalankan.
   */
  beforeAll(() => {
    unlinkMock = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
  });

  /**
   * Mengembalikan fungsi unlinkSync ke implementasi aslinya setelah seluruh pengujian selesai.
   */
  afterAll(() => {
    unlinkMock.mockRestore();
  });

  /**
   * Membersihkan seluruh mock dan menginisialisasi ulang service sebelum setiap pengujian.
   */
  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(mockPrisma as any);
  });

  describe('create', () => {
    /**
     * Menguji pembuatan task baru beserta assignment ke beberapa intern.
     */
    it('should create a task and assign interns', async () => {
      mockPrisma.task.create.mockResolvedValue({
        id: 1,
        title: 'Test',
        description: 'desc',
        deadline: new Date(),
        createdBy: 1,
      });
      mockPrisma.taskAssignment.createMany.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});
      const dto = {
        title: 'Test',
        description: 'desc',
        deadline: '2025-12-31',
        internIds: [2, 3],
      };
      const result = await service.create(1, dto as any);
      expect(mockPrisma.task.create).toHaveBeenCalled();
      expect(mockPrisma.taskAssignment.createMany).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('assignTask', () => {
    /**
     * Menguji assignment task ke beberapa intern pada task yang sudah ada.
     */
    it('should assign interns to existing task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.taskAssignment.createMany.mockResolvedValue({});
      const dto = { internIds: [2, 3] };
      await expect(service.assignTask(1, dto as any)).resolves.not.toThrow();
    });

    /**
     * Menguji error ketika task yang ingin di-assign tidak ditemukan.
     */
    it('should throw if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      await expect(
        service.assignTask(99, { internIds: [2] } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitTask', () => {
    /**
     * Menguji error ketika submit task tanpa file dan deskripsi.
     */
    it('should throw if no file and no description', async () => {
      await expect(service.submitTask(1, 1)).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji error ketika user tidak terdaftar pada assignment task.
     */
    it('should throw if user not assigned', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue(null);
      await expect(
        service.submitTask(
          1,
          1,
          { path: 'file.pdf', mimetype: 'application/pdf', size: 1000 } as any,
          'desc',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    /**
     * Menguji error ketika user sudah pernah melakukan submit pada task yang sama.
     */
    it('should throw if already submitted', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 1,
      });
      mockPrisma.submission.findFirst.mockResolvedValue({ id: 1 });
      await expect(
        service.submitTask(
          1,
          1,
          { path: 'file.pdf', mimetype: 'application/pdf', size: 1000 } as any,
          'desc',
        ),
      ).rejects.toThrow(ConflictException);
    });

    /**
     * Menguji proses submit task yang valid.
     */
    it('should submit if valid', async () => {
      mockPrisma.taskAssignment.findUnique.mockResolvedValue({
        taskId: 1,
        userId: 1,
      });
      mockPrisma.submission.findFirst.mockResolvedValue(null);
      mockPrisma.task.findUnique.mockResolvedValue({
        deadline: new Date(Date.now() + 10000),
      });
      mockPrisma.submission.create.mockResolvedValue({ id: 1 });
      const file = {
        path: 'file.pdf',
        mimetype: 'application/pdf',
        size: 1000,
      } as any;
      const result = await service.submitTask(1, 1, file, 'desc');
      expect(result.id).toBe(1);
    });
  });

  describe('gradeSubmission', () => {
    /**
     * Menguji error ketika submission tidak ditemukan.
     */
    it('should throw if submission not found', async () => {
      mockPrisma.submission.findUnique.mockResolvedValue(null);
      await expect(
        service.gradeSubmission(1, { status: 'reviewed' } as any, 1),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * Menguji error ketika user yang melakukan grading bukan pembuat task.
     */
    it('should throw if not creator', async () => {
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 2 },
        status: 'submitted',
      });
      await expect(
        service.gradeSubmission(1, { status: 'reviewed' } as any, 1),
      ).rejects.toThrow(ForbiddenException);
    });

    /**
     * Menguji proses grading submission dengan status revisi.
     */
    it('should grade as revisi', async () => {
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 1 },
        status: 'submitted',
        userId: 2,
      });
      mockPrisma.submission.update.mockResolvedValue({ id: 1, userId: 2 });
      mockPrisma.notification.create.mockResolvedValue({});
      const result = await service.gradeSubmission(
        1,
        { status: 'revisi', feedback: 'Perbaiki' } as any,
        1,
      );
      expect(result.id).toBe(1);
    });

    /**
     * Menguji proses grading submission dengan status reviewed.
     */
    it('should grade as reviewed', async () => {
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 1,
        task: { createdBy: 1 },
        status: 'submitted',
        userId: 2,
      });
      mockPrisma.submission.update.mockResolvedValue({ id: 1, userId: 2 });
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});
      const result = await service.gradeSubmission(
        1,
        { status: 'reviewed', grade: 90, feedback: 'Bagus' } as any,
        1,
      );
      expect(result.id).toBe(1);
    });
  });
});
