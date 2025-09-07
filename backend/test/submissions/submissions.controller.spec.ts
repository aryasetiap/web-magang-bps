/**
 * Unit Test SubmissionsController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama SubmissionsController,
 * termasuk resubmit, submit, dan grade.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 *
 * Tujuan:
 * - Memastikan setiap endpoint pada SubmissionsController berjalan sesuai ekspektasi.
 * - Menangani skenario sukses dan gagal pada setiap endpoint.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from '../../src/submissions/submissions.controller';
import { SubmissionsService } from '../../src/submissions/submissions.service';
import { CreateSubmissionDto } from '../../src/submissions/dto/create-submission.dto';
import { GradeSubmissionDto } from '../../src/submissions/dto/grade-submission.dto';

// Konstanta untuk data dummy yang sering digunakan
const MOCK_FILE = { path: 'file.pdf' };
const MOCK_DESCRIPTION = 'desc';
const MOCK_USER_ID_2 = 2;
const MOCK_USER_ID_3 = 3;
const MOCK_USER_ID_99 = 99;
const MOCK_SUBMISSION_ID_1 = 1;
const MOCK_SUBMISSION_ID_2 = 2;
const MOCK_TASK_ID_10 = 10;
const MOCK_GRADE_DTO: GradeSubmissionDto = {
  grade: 90,
  feedback: 'Bagus',
  status: 'reviewed',
};
const MOCK_CREATE_DTO: CreateSubmissionDto = { description: MOCK_DESCRIPTION };

describe('SubmissionsController', () => {
  /**
   * Inisialisasi controller dan service mock sebelum setiap pengujian.
   */
  let controller: SubmissionsController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      resubmit: jest.fn(),
      submit: jest.fn(),
      grade: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [{ provide: SubmissionsService, useValue: service }],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  /**
   * Pengujian endpoint resubmit
   * -------------------------------------------
   * Menguji proses pengiriman ulang (resubmit) submission.
   */
  describe('resubmit', () => {
    /**
     * Pengujian berhasil melakukan resubmit submission.
     * Memastikan controller memanggil service dengan parameter yang benar dan mengembalikan hasil yang sesuai.
     */
    it('berhasil resubmit submission', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_2 } };
      service.resubmit.mockResolvedValue({
        id: MOCK_SUBMISSION_ID_1,
        filePath: MOCK_FILE.path,
      });

      // Act
      const result = await controller.resubmit(
        MOCK_SUBMISSION_ID_1,
        MOCK_FILE as any,
        MOCK_DESCRIPTION,
        req as any,
      );

      // Assert
      expect(result).toEqual({
        id: MOCK_SUBMISSION_ID_1,
        filePath: MOCK_FILE.path,
      });
      expect(service.resubmit).toBeCalledWith(
        MOCK_SUBMISSION_ID_1,
        MOCK_USER_ID_2,
        MOCK_FILE,
        MOCK_DESCRIPTION,
      );
    });

    /**
     * Pengujian gagal melakukan resubmit jika terjadi error pada service.
     * Memastikan error dilemparkan dengan benar.
     */
    it('gagal jika service error', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_2 } };
      service.resubmit.mockRejectedValue(new Error('error'));

      // Act & Assert
      await expect(
        controller.resubmit(
          MOCK_SUBMISSION_ID_1,
          undefined as any,
          MOCK_DESCRIPTION,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint submit
   * -------------------------------------------
   * Menguji proses pengiriman tugas (submit) submission.
   */
  describe('submit', () => {
    /**
     * Pengujian berhasil melakukan submit tugas.
     * Memastikan controller memanggil service dengan parameter yang benar dan mengembalikan hasil yang sesuai.
     */
    it('berhasil submit tugas', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_3 } };
      service.submit.mockResolvedValue({
        id: MOCK_SUBMISSION_ID_2,
        filePath: MOCK_FILE.path,
      });

      // Act
      const result = await controller.submit(
        MOCK_TASK_ID_10,
        MOCK_FILE as any,
        MOCK_CREATE_DTO,
        req as any,
      );

      // Assert
      expect(result).toEqual({
        id: MOCK_SUBMISSION_ID_2,
        filePath: MOCK_FILE.path,
      });
      expect(service.submit).toBeCalledWith(
        MOCK_TASK_ID_10,
        MOCK_USER_ID_3,
        MOCK_FILE,
        MOCK_DESCRIPTION,
      );
    });

    /**
     * Pengujian gagal melakukan submit jika terjadi error pada service.
     * Memastikan error dilemparkan dengan benar.
     */
    it('gagal jika service error', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_3 } };
      service.submit.mockRejectedValue(new Error('error'));

      // Act & Assert
      await expect(
        controller.submit(
          MOCK_TASK_ID_10,
          MOCK_FILE as any,
          MOCK_CREATE_DTO,
          req as any,
        ),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint grade
   * -------------------------------------------
   * Menguji proses pemberian nilai (grade) pada submission.
   */
  describe('grade', () => {
    /**
     * Pengujian berhasil memberikan penilaian submission.
     * Memastikan controller memanggil service dengan parameter yang benar dan mengembalikan hasil yang sesuai.
     */
    it('berhasil memberikan penilaian submission', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_99 } };
      service.grade.mockResolvedValue({
        id: MOCK_SUBMISSION_ID_1,
        grade: 90,
        status: 'reviewed',
      });

      // Act
      const result = await controller.grade(
        MOCK_SUBMISSION_ID_1,
        MOCK_GRADE_DTO,
        req as any,
      );

      // Assert
      expect(result).toEqual({
        id: MOCK_SUBMISSION_ID_1,
        grade: 90,
        status: 'reviewed',
      });
      expect(service.grade).toBeCalledWith(
        MOCK_SUBMISSION_ID_1,
        MOCK_GRADE_DTO,
        MOCK_USER_ID_99,
      );
    });

    /**
     * Pengujian gagal memberikan penilaian jika terjadi error pada service.
     * Memastikan error dilemparkan dengan benar.
     */
    it('gagal jika service error', async () => {
      // Arrange
      const req = { user: { userId: MOCK_USER_ID_99 } };
      service.grade.mockRejectedValue(new Error('error'));

      // Act & Assert
      await expect(
        controller.grade(MOCK_SUBMISSION_ID_1, MOCK_GRADE_DTO, req as any),
      ).rejects.toThrow('error');
    });
  });
});
