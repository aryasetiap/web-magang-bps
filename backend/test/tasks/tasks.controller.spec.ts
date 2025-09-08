/**
 * Unit Test TasksController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama TasksController.
 * Setiap bagian test didokumentasikan dengan docstring berbahasa Indonesia.
 *
 * Test ini memastikan seluruh endpoint berjalan sesuai ekspektasi,
 * baik pada kondisi sukses maupun gagal.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../../src/tasks/tasks.controller';
import { TasksService } from '../../src/tasks/tasks.service';
import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../src/tasks/dto/update-task.dto';
import { AssignTaskDto } from '../../src/tasks/dto/assign-task.dto';
import { GradeSubmissionDto } from '../../src/submissions/dto/grade-submission.dto';
import { ForbiddenException } from '@nestjs/common';

// Konstanta dummy yang sering digunakan pada test
const DUMMY_USER_ID = 1;
const DUMMY_INTERN_ID = 2;
const DUMMY_ADMIN_ID = 99;
const DUMMY_TASK_ID = 1;
const DUMMY_FILE = { path: 'file.pdf' };
const DUMMY_CREATE_TASK_DTO: CreateTaskDto = {
  title: 'Tugas',
  description: 'Deskripsi',
  deadline: '2025-07-01',
  internIds: [2, 3],
};
const DUMMY_ASSIGN_TASK_DTO: AssignTaskDto = { internIds: [2, 3] };
const DUMMY_GRADE_SUBMISSION_DTO: GradeSubmissionDto = {
  status: 'reviewed',
  feedback: 'ok',
  grade: 90,
};
const DUMMY_UPDATE_TASK_DTO: UpdateTaskDto = { title: 'Baru' };

describe('TasksController', () => {
  /**
   * Inisialisasi controller dan service mock sebelum setiap test.
   */
  let controller: TasksController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      assignTask: jest.fn(),
      submitTask: jest.fn(),
      findSubmissionsForTask: jest.fn(),
      gradeSubmission: jest.fn(),
      findTasksForUser: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      isUserAssignedToTask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  /**
   * Pengujian endpoint create
   * -----------------------------------------------
   * Menguji proses pembuatan tugas baru.
   */
  describe('create', () => {
    /**
     * Test: Berhasil membuat tugas baru.
     * Memastikan controller memanggil service dengan benar dan mengembalikan hasil yang sesuai.
     */
    it('berhasil membuat tugas baru', async () => {
      const req = { user: { userId: DUMMY_USER_ID } };
      service.create.mockResolvedValue({
        id: DUMMY_TASK_ID,
        ...DUMMY_CREATE_TASK_DTO,
      });

      const result = await controller.create(
        req as any,
        DUMMY_CREATE_TASK_DTO,
        DUMMY_FILE as any,
      );

      expect(result).toEqual({ id: DUMMY_TASK_ID, ...DUMMY_CREATE_TASK_DTO });
      expect(service.create).toBeCalledWith(
        DUMMY_USER_ID,
        DUMMY_CREATE_TASK_DTO,
        DUMMY_FILE,
      );
    });

    /**
     * Test: Gagal membuat tugas jika terjadi error pada service.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: DUMMY_USER_ID } };
      service.create.mockRejectedValue(new Error('error'));

      await expect(
        controller.create(req as any, DUMMY_CREATE_TASK_DTO, DUMMY_FILE as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint assignTask
   * -----------------------------------------------
   * Menguji proses assign tugas ke intern.
   */
  describe('assignTask', () => {
    /**
     * Test: Berhasil assign tugas ke intern.
     * Memastikan jumlah assignment sesuai dengan hasil dari service.
     */
    it('berhasil assign tugas ke intern', async () => {
      service.assignTask.mockResolvedValue({ count: 2 });

      const result = await controller.assignTask(
        DUMMY_TASK_ID,
        DUMMY_ASSIGN_TASK_DTO,
      );

      expect(result).toEqual({ count: 2 });
      expect(service.assignTask).toBeCalledWith(
        DUMMY_TASK_ID,
        DUMMY_ASSIGN_TASK_DTO,
      );
    });

    /**
     * Test: Gagal assign tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      service.assignTask.mockRejectedValue(new Error('error'));

      await expect(
        controller.assignTask(DUMMY_TASK_ID, DUMMY_ASSIGN_TASK_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint submitTask
   * -----------------------------------------------
   * Menguji proses submit tugas oleh intern.
   */
  describe('submitTask', () => {
    /**
     * Test: Berhasil submit tugas.
     * Memastikan file dan deskripsi dikirim ke service dengan benar.
     */
    it('berhasil submit tugas', async () => {
      const req = { user: { userId: DUMMY_INTERN_ID } };
      const description = 'Jawaban';
      service.submitTask.mockResolvedValue({
        id: 1,
        filePath: DUMMY_FILE.path,
      });

      const result = await controller.submitTask(
        DUMMY_TASK_ID,
        req as any,
        DUMMY_FILE as any,
        description,
      );

      expect(result).toEqual({ id: 1, filePath: DUMMY_FILE.path });
      expect(service.submitTask).toBeCalledWith(
        DUMMY_INTERN_ID,
        DUMMY_TASK_ID,
        DUMMY_FILE,
        description,
      );
    });

    /**
     * Test: Gagal submit tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: DUMMY_INTERN_ID } };
      const description = 'Jawaban';
      service.submitTask.mockRejectedValue(new Error('error'));

      await expect(
        controller.submitTask(
          DUMMY_TASK_ID,
          req as any,
          DUMMY_FILE as any,
          description,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findSubmissionsForTask
   * -----------------------------------------------
   * Menguji proses pengambilan seluruh submission untuk sebuah tugas.
   */
  describe('findSubmissionsForTask', () => {
    /**
     * Test: Berhasil mengambil seluruh submission.
     * Memastikan hasil dari service dikembalikan dengan benar.
     */
    it('berhasil mengambil seluruh submission', async () => {
      const submissions = [{ id: 1 }, { id: 2 }];
      service.findSubmissionsForTask.mockResolvedValue(submissions);

      const result = await controller.findSubmissionsForTask(DUMMY_TASK_ID);

      expect(result).toEqual(submissions);
      expect(service.findSubmissionsForTask).toBeCalledWith(DUMMY_TASK_ID);
    });

    /**
     * Test: Gagal mengambil submission jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      service.findSubmissionsForTask.mockRejectedValue(new Error('error'));

      await expect(
        controller.findSubmissionsForTask(DUMMY_TASK_ID),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint gradeSubmission
   * -----------------------------------------------
   * Menguji proses pemberian nilai pada submission.
   */
  describe('gradeSubmission', () => {
    /**
     * Test: Berhasil memberikan nilai pada submission.
     * Memastikan data nilai dikirim ke service dengan benar.
     */
    it('berhasil memberikan nilai pada submission', async () => {
      const req = { user: { userId: DUMMY_ADMIN_ID } };
      service.gradeSubmission.mockResolvedValue({
        id: 1,
        status: 'reviewed',
        grade: 90,
      });

      const result = await controller.gradeSubmission(
        2,
        DUMMY_GRADE_SUBMISSION_DTO,
        req as any,
      );

      expect(result).toEqual({ id: 1, status: 'reviewed', grade: 90 });
      expect(service.gradeSubmission).toBeCalledWith(
        2,
        DUMMY_GRADE_SUBMISSION_DTO,
        DUMMY_ADMIN_ID,
      );
    });

    /**
     * Test: Gagal memberikan nilai jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: DUMMY_ADMIN_ID } };
      service.gradeSubmission.mockRejectedValue(new Error('error'));

      await expect(
        controller.gradeSubmission(2, DUMMY_GRADE_SUBMISSION_DTO, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findMyTasks
   * -----------------------------------------------
   * Menguji proses pengambilan daftar tugas milik user.
   */
  describe('findMyTasks', () => {
    /**
     * Test: Berhasil mengambil daftar tugas user.
     * Memastikan parameter userId, page, dan limit dikirim ke service.
     */
    it('berhasil mengambil daftar tugas user', async () => {
      const req = {
        user: { userId: DUMMY_INTERN_ID },
        query: { page: '1', limit: '10' },
      };
      service.findTasksForUser.mockResolvedValue([{ id: 1 }]);

      const result = await controller.findMyTasks(req as any);

      expect(result).toEqual([{ id: 1 }]);
      expect(service.findTasksForUser).toBeCalledWith(DUMMY_INTERN_ID, 1, 10);
    });

    /**
     * Test: Gagal mengambil tugas user jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      const req = {
        user: { userId: DUMMY_INTERN_ID },
        query: { page: '1', limit: '10' },
      };
      service.findTasksForUser.mockRejectedValue(new Error('error'));

      await expect(controller.findMyTasks(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findAll
   * -----------------------------------------------
   * Menguji proses pengambilan seluruh tugas.
   */
  describe('findAll', () => {
    /**
     * Test: Berhasil mengambil seluruh tugas.
     * Memastikan hasil dari service dikembalikan dengan benar.
     */
    it('berhasil mengambil seluruh tugas', async () => {
      const data = { data: [{ id: 1 }] };
      service.findAll.mockResolvedValue(data);

      const result = await controller.findAll();

      expect(result).toEqual(data);
      expect(service.findAll).toBeCalled();
    });

    /**
     * Test: Gagal mengambil seluruh tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      service.findAll.mockRejectedValue(new Error('error'));

      await expect(controller.findAll()).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint findOne
   * -----------------------------------------------
   * Menguji proses pengambilan detail tugas.
   */
  describe('findOne', () => {
    /**
     * Test: Berhasil mengambil detail tugas oleh admin/staff.
     * Memastikan user dengan role admin dapat mengambil detail tugas.
     */
    it('berhasil mengambil detail tugas (admin/staff)', async () => {
      const req = { user: { userId: DUMMY_USER_ID, role: 'Admin' } };
      const task = { id: DUMMY_TASK_ID, title: 'Tugas' };
      service.findOne.mockResolvedValue(task);

      const result = await controller.findOne(DUMMY_TASK_ID, req as any);

      expect(result).toEqual(task);
      expect(service.findOne).toBeCalledWith(DUMMY_TASK_ID);
    });

    /**
     * Test: Berhasil mengambil detail tugas oleh intern yang di-assign.
     * Memastikan hanya intern yang di-assign yang bisa akses detail tugas.
     */
    it('berhasil mengambil detail tugas (intern yang di-assign)', async () => {
      const req = { user: { userId: DUMMY_INTERN_ID, role: 'Intern' } };
      const task = { id: DUMMY_TASK_ID, title: 'Tugas' };
      service.findOne.mockResolvedValue(task);
      service.isUserAssignedToTask.mockResolvedValue(true);

      const result = await controller.findOne(DUMMY_TASK_ID, req as any);

      expect(result).toEqual(task);
      expect(service.findOne).toBeCalledWith(DUMMY_TASK_ID);
      expect(service.isUserAssignedToTask).toBeCalledWith(
        DUMMY_TASK_ID,
        DUMMY_INTERN_ID,
      );
    });

    /**
     * Test: Gagal mengambil detail tugas jika intern tidak di-assign.
     * Memastikan ForbiddenException dilempar jika intern tidak di-assign ke tugas.
     */
    it('gagal jika intern tidak di-assign ke tugas', async () => {
      const req = { user: { userId: DUMMY_INTERN_ID, role: 'Intern' } };
      service.findOne.mockResolvedValue({ id: DUMMY_TASK_ID, title: 'Tugas' });
      service.isUserAssignedToTask.mockResolvedValue(false);

      await expect(
        controller.findOne(DUMMY_TASK_ID, req as any),
      ).rejects.toThrow(ForbiddenException);
    });

    /**
     * Test: Gagal mengambil detail tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      const req = { user: { userId: DUMMY_USER_ID, role: 'Admin' } };
      service.findOne.mockRejectedValue(new Error('error'));

      await expect(
        controller.findOne(DUMMY_TASK_ID, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint update
   * -----------------------------------------------
   * Menguji proses update tugas.
   */
  describe('update', () => {
    /**
     * Test: Berhasil update tugas.
     * Memastikan data update dikirim ke service dengan benar.
     */
    it('berhasil update tugas', async () => {
      service.update.mockResolvedValue({ id: DUMMY_TASK_ID, title: 'Baru' });

      const result = await controller.update(
        DUMMY_TASK_ID,
        DUMMY_UPDATE_TASK_DTO,
      );

      expect(result).toEqual({ id: DUMMY_TASK_ID, title: 'Baru' });
      expect(service.update).toBeCalledWith(
        DUMMY_TASK_ID,
        DUMMY_UPDATE_TASK_DTO,
      );
    });

    /**
     * Test: Gagal update tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      service.update.mockRejectedValue(new Error('error'));

      await expect(
        controller.update(DUMMY_TASK_ID, DUMMY_UPDATE_TASK_DTO),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint remove
   * -----------------------------------------------
   * Menguji proses penghapusan tugas.
   */
  describe('remove', () => {
    /**
     * Test: Berhasil menghapus tugas.
     * Memastikan tugas dihapus dan hasilnya dikembalikan.
     */
    it('berhasil menghapus tugas', async () => {
      service.remove.mockResolvedValue({ id: DUMMY_TASK_ID });

      const result = await controller.remove(DUMMY_TASK_ID);

      expect(result).toEqual({ id: DUMMY_TASK_ID });
      expect(service.remove).toBeCalledWith(DUMMY_TASK_ID);
    });

    /**
     * Test: Gagal menghapus tugas jika service error.
     * Memastikan error dilempar ke caller.
     */
    it('gagal jika service error', async () => {
      service.remove.mockRejectedValue(new Error('error'));

      await expect(controller.remove(DUMMY_TASK_ID)).rejects.toThrow('error');
    });
  });
});
