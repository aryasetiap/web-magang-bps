/**
 * Unit Test CertificatesController
 * -------------------------------------------------
 * Pengujian seluruh endpoint utama CertificatesController,
 * termasuk generate, upload, issue, getOwn, uploadTemplate,
 * download, checkTemplate, dan getAllCertificates.
 * Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesController } from '../../src/certificates/certificates.controller';
import { CertificatesService } from '../../src/certificates/certificates.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCertificateDto } from '../../src/certificates/dto/create-certificate.dto';
import { UpdateCertificateStatusDto } from '../../src/certificates/dto/update-certificate-status.dto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CertificateStatusDto } from '../../src/certificates/dto/update-certificate-status.dto';
import { CertificateStatus } from '@prisma/client';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(() => ({ pipe: jest.fn() })),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Konstanta untuk data dummy yang sering digunakan
const DUMMY_USER_ID = 99;
const DUMMY_CERTIFICATE_ID = 1;
const DUMMY_CERTIFICATE_NUMBER = '123/ABC';
const DUMMY_CERTIFICATE_NUMBER_SIMPLE = '123';
const DUMMY_FILE_PATH = 'signed.pdf';
const DUMMY_ADMIN_ROLE = 'Admin';
const DUMMY_INTERN_ROLE = 'Intern';

describe('CertificatesController', () => {
  /**
   * Inisialisasi variabel controller dan service mock.
   */
  let controller: CertificatesController;
  let service: Record<string, jest.Mock>;
  // Definisikan prismaMock di sini agar bisa diakses di dalam test case
  let prismaMock: any;

  beforeEach(async () => {
    service = {
      generateCertificate: jest.fn(),
      uploadSignedCertificate: jest.fn(),
      issueCertificate: jest.fn(),
      getCertificateByUser: jest.fn(),
      getCertificateById: jest.fn(),
      getAllCertificates: jest.fn(),
      updateCertificateStatus: jest.fn(),
    };

    // FIX: Membuat mock PrismaService yang lebih lengkap
    prismaMock = {
      certificate: {
        update: jest.fn(),
        // Tambahkan properti lain yang mungkin diperlukan oleh tipe Prisma
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findFirstOrThrow: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
        fields: {}, // Tambahkan properti 'fields' yang kosong
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        { provide: CertificatesService, useValue: service },
        // Sediakan mock PrismaService juga jika dibutuhkan oleh controller/service
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<CertificatesController>(CertificatesController);
  });

  /**
   * Pengujian endpoint generate sertifikat.
   * Menguji proses pembuatan sertifikat baru.
   */
  describe('generate', () => {
    /**
     * Menguji kasus sukses generate sertifikat.
     * Pastikan service dipanggil dengan parameter yang benar.
     */
    it('berhasil generate sertifikat', async () => {
      const dto: CreateCertificateDto = {
        certificateNumber: DUMMY_CERTIFICATE_NUMBER,
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      const req = { user: { userId: DUMMY_USER_ID, role: 'Admin' } };
      service.generateCertificate.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
      });

      const result = await controller.generate(dto, req as any);

      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID });
      expect(service.generateCertificate).toBeCalledWith(dto, DUMMY_USER_ID);
    });

    /**
     * Menguji kasus gagal generate jika terjadi error pada service.
     */
    it('gagal generate jika service error', async () => {
      const dto: CreateCertificateDto = {
        certificateNumber: DUMMY_CERTIFICATE_NUMBER,
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      const req = { user: { userId: DUMMY_USER_ID, role: 'Admin' } };
      service.generateCertificate.mockRejectedValue(new Error('error'));

      await expect(controller.generate(dto, req as any)).rejects.toThrow(
        'error',
      );
    });

    /**
     * Menguji kasus gagal generate jika bukan admin.
     */
    it('gagal generate jika bukan admin', async () => {
      const dto: CreateCertificateDto = {
        certificateNumber: DUMMY_CERTIFICATE_NUMBER,
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      const req = { user: { userId: DUMMY_USER_ID, role: 'Intern' } };

      await expect(controller.generate(dto, req as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /**
   * Pengujian endpoint uploadSigned.
   * Menguji proses upload file sertifikat yang sudah ditandatangani.
   */
  describe('uploadSigned', () => {
    it('berhasil upload file signed', async () => {
      const req = { user: { userId: DUMMY_USER_ID } };
      const file = { path: DUMMY_FILE_PATH };
      service.uploadSignedCertificate.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'signed',
      });

      const result = await controller.uploadSigned(
        DUMMY_CERTIFICATE_ID,
        file as any,
        req as any,
      );

      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID, status: 'signed' });
      expect(service.uploadSignedCertificate).toBeCalledWith(
        DUMMY_CERTIFICATE_ID,
        DUMMY_FILE_PATH,
        DUMMY_USER_ID,
      );
    });

    it('gagal jika file tidak diupload', async () => {
      const req = { user: { userId: DUMMY_USER_ID } };
      await expect(
        controller.uploadSigned(
          DUMMY_CERTIFICATE_ID,
          undefined as any,
          req as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika service error', async () => {
      const req = { user: { userId: DUMMY_USER_ID } };
      const file = { path: DUMMY_FILE_PATH };
      service.uploadSignedCertificate.mockRejectedValue(new Error('error'));

      await expect(
        controller.uploadSigned(DUMMY_CERTIFICATE_ID, file as any, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint issue sertifikat.
   */
  describe('issue', () => {
    it('berhasil issue sertifikat', async () => {
      const req = { user: { id: DUMMY_USER_ID } };
      service.issueCertificate.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'issued',
      });

      const result = await controller.issue(DUMMY_CERTIFICATE_ID, req as any);

      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID, status: 'issued' });
      expect(service.issueCertificate).toBeCalledWith(
        DUMMY_CERTIFICATE_ID,
        DUMMY_USER_ID,
      );
    });

    it('gagal jika service error', async () => {
      const req = { user: { id: DUMMY_USER_ID } };
      service.issueCertificate.mockRejectedValue(new Error('error'));

      await expect(
        controller.issue(DUMMY_CERTIFICATE_ID, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint getOwn.
   */
  describe('getOwn', () => {
    it('berhasil mengambil sertifikat sendiri', async () => {
      const req = { user: { userId: 1 } };
      service.getCertificateByUser.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
      });

      const result = await controller.getOwn(req as any);

      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID });
      expect(service.getCertificateByUser).toBeCalledWith(1);
    });

    it('gagal jika service error', async () => {
      const req = { user: { userId: 1 } };
      service.getCertificateByUser.mockRejectedValue(new Error('error'));

      await expect(controller.getOwn(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint uploadTemplate.
   */
  describe('uploadTemplate', () => {
    it('berhasil upload template PDF', () => {
      const file = { buffer: Buffer.from('dummy pdf content') };
      const result = controller.uploadTemplate(file as any);
      expect(result).toEqual({
        success: true,
        message: 'Template sertifikat berhasil diunggah.',
      });
    });

    it('gagal jika file tidak diupload', () => {
      expect(() => controller.uploadTemplate(undefined as any)).toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian endpoint download sertifikat.
   */
  describe('download', () => {
    const fs = require('fs');
    let res: any;

    beforeEach(() => {
      res = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };
      jest.clearAllMocks();
    });

    it('berhasil download file issued', async () => {
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'issued',
        signedFilePath: DUMMY_FILE_PATH,
        certificateNumber: DUMMY_CERTIFICATE_NUMBER_SIMPLE,
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createReadStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });

      await controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res);

      expect(service.getCertificateById).toBeCalledWith(DUMMY_CERTIFICATE_ID);
      expect(res.setHeader).toBeCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toBeCalledWith(
        'Content-Disposition',
        expect.stringContaining('Sertifikat_123.pdf'),
      );
    });

    it('berhasil download file generated', async () => {
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'generated',
        templatePath: 'template.pdf',
        certificateNumber: DUMMY_CERTIFICATE_NUMBER_SIMPLE,
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createReadStream as jest.Mock).mockReturnValue({ pipe: jest.fn() });

      await controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res);

      expect(res.setHeader).toBeCalledWith(
        'Content-Disposition',
        expect.stringContaining('Certificate_123_for-signing.pdf'),
      );
    });

    it('gagal jika sertifikat tidak ditemukan', async () => {
      service.getCertificateById.mockResolvedValue(null);

      await expect(
        controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res),
      ).rejects.toThrow(NotFoundException);
    });

    it('gagal jika status sertifikat tidak valid', async () => {
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'other',
      });

      await expect(
        controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res),
      ).rejects.toThrow(BadRequestException);
    });

    it('gagal jika file tidak ditemukan di server', async () => {
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'issued',
        signedFilePath: DUMMY_FILE_PATH,
        certificateNumber: DUMMY_CERTIFICATE_NUMBER_SIMPLE,
      });
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pengujian endpoint checkTemplate.
   */
  describe('checkTemplate', () => {
    const fs = require('fs');

    it('mengembalikan status template tersedia', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = controller.checkTemplate();
      expect(result).toEqual({
        templateExists: true,
        templatePath:
          './uploads/certificate-templates/certificate-template.pdf',
      });
    });

    it('mengembalikan status template tidak tersedia', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = controller.checkTemplate();
      expect(result).toEqual({
        templateExists: false,
        templatePath: null,
      });
    });
  });

  /**
   * Pengujian endpoint getAllCertificates.
   */
  describe('getAllCertificates', () => {
    it('berhasil mengambil seluruh data sertifikat jika user admin', async () => {
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      service.getAllCertificates.mockResolvedValue([
        { id: DUMMY_CERTIFICATE_ID },
      ]);

      const result = await controller.getAllCertificates(req as any);

      expect(result).toEqual([{ id: DUMMY_CERTIFICATE_ID }]);
      expect(service.getAllCertificates).toBeCalled();
    });

    it('gagal jika user bukan admin', async () => {
      const req = { user: { role: DUMMY_INTERN_ROLE } };
      await expect(controller.getAllCertificates(req as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('gagal jika service error', async () => {
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      service.getAllCertificates.mockRejectedValue(new Error('error'));

      await expect(controller.getAllCertificates(req as any)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint updateStatus.
   */
  describe('updateStatus', () => {
    it('gagal jika user bukan admin', async () => {
      const req = { user: { role: DUMMY_INTERN_ROLE } };
      const dto: UpdateCertificateStatusDto = {
        status: CertificateStatus.issued,
      } as any;
      await expect(
        controller.updateStatus(DUMMY_CERTIFICATE_ID, dto, req as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gagal jika sertifikat tidak ditemukan', async () => {
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      const dto: UpdateCertificateStatusDto = {
        status: CertificateStatus.issued,
      } as any;
      service.getCertificateById.mockResolvedValue(null);
      await expect(
        controller.updateStatus(DUMMY_CERTIFICATE_ID, dto, req as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('berhasil update status sertifikat', async () => {
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      const dto: UpdateCertificateStatusDto = {
        status: CertificateStatusDto.issued,
      } as any;
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: CertificateStatusDto.generated,
      });

      // Tambahkan properti prisma pada objek service (bukan pada mock function)
      (service as any).prisma = {
        certificate: {
          update: jest.fn().mockResolvedValue({
            id: DUMMY_CERTIFICATE_ID,
            status: CertificateStatusDto.issued,
          }),
        },
      };

      const result = await controller.updateStatus(
        DUMMY_CERTIFICATE_ID,
        dto,
        req as any,
      );
      expect(result).toEqual({
        id: DUMMY_CERTIFICATE_ID,
        status: CertificateStatusDto.issued,
      });
      expect((service as any).prisma.certificate.update).toBeCalledWith({
        where: { id: DUMMY_CERTIFICATE_ID },
        data: { status: CertificateStatusDto.issued },
      });
    });
  });

  /**
   * Pengujian endpoint getById.
   */
  describe('getById', () => {
    it('gagal jika sertifikat tidak ditemukan', async () => {
      service.getCertificateById.mockResolvedValue(null);
      await expect(controller.getById(DUMMY_CERTIFICATE_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('berhasil jika sertifikat ditemukan', async () => {
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
      });
      const result = await controller.getById(DUMMY_CERTIFICATE_ID);
      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID });
    });
  });
});
