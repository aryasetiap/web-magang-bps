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

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(() => ({ pipe: jest.fn() })),
}));

// Konstanta untuk data dummy yang sering digunakan
const DUMMY_USER_ID = 99;
const DUMMY_CERTIFICATE_ID = 1;
const DUMMY_CERTIFICATE_NUMBER = '123/ABC';
const DUMMY_CERTIFICATE_NUMBER_SIMPLE = '123';
const DUMMY_FILE_PATH = 'signed.pdf';
const DUMMY_TEMPLATE_PATH = 'certificate-template.pdf';
const DUMMY_ADMIN_ROLE = 'Admin';
const DUMMY_INTERN_ROLE = 'Intern';

describe('CertificatesController', () => {
  /**
   * Inisialisasi variabel controller dan service mock.
   */
  let controller: CertificatesController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      generateCertificate: jest.fn(),
      uploadSignedCertificate: jest.fn(),
      issueCertificate: jest.fn(),
      getCertificateByUser: jest.fn(),
      getCertificateById: jest.fn(),
      getAllCertificates: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [{ provide: CertificatesService, useValue: service }],
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
      /**
       * Tujuan: Memastikan endpoint generate dapat membuat sertifikat baru dengan benar.
       */
      const dto: CreateCertificateDto = {
        certificateNumber: DUMMY_CERTIFICATE_NUMBER,
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      const req = { user: { userId: DUMMY_USER_ID } };
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
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const dto: CreateCertificateDto = {
        certificateNumber: DUMMY_CERTIFICATE_NUMBER,
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      const req = { user: { userId: DUMMY_USER_ID } };
      service.generateCertificate.mockRejectedValue(new Error('error'));

      await expect(controller.generate(dto, req as any)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint uploadSigned.
   * Menguji proses upload file sertifikat yang sudah ditandatangani.
   */
  describe('uploadSigned', () => {
    /**
     * Menguji kasus sukses upload file signed.
     */
    it('berhasil upload file signed', async () => {
      /**
       * Tujuan: Memastikan file signed dapat diupload dan service dipanggil dengan benar.
       */
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

    /**
     * Menguji kasus gagal upload jika file tidak diupload.
     */
    it('gagal jika file tidak diupload', async () => {
      /**
       * Tujuan: Memastikan error dilempar jika file tidak ada.
       */
      const req = { user: { userId: DUMMY_USER_ID } };
      await expect(
        controller.uploadSigned(
          DUMMY_CERTIFICATE_ID,
          undefined as any,
          req as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji kasus gagal upload jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
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
   * Menguji proses penerbitan sertifikat.
   */
  describe('issue', () => {
    /**
     * Menguji kasus sukses issue sertifikat.
     */
    it('berhasil issue sertifikat', async () => {
      /**
       * Tujuan: Memastikan sertifikat dapat diterbitkan dengan benar.
       */
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

    /**
     * Menguji kasus gagal issue jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { id: DUMMY_USER_ID } };
      service.issueCertificate.mockRejectedValue(new Error('error'));

      await expect(
        controller.issue(DUMMY_CERTIFICATE_ID, req as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint getOwn.
   * Menguji proses pengambilan sertifikat milik sendiri oleh intern.
   */
  describe('getOwn', () => {
    /**
     * Menguji kasus sukses mengambil sertifikat sendiri.
     */
    it('berhasil mengambil sertifikat sendiri', async () => {
      /**
       * Tujuan: Memastikan intern dapat mengambil sertifikat miliknya sendiri.
       */
      const req = { user: { userId: 1 } };
      service.getCertificateByUser.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
      });

      const result = await controller.getOwn(req as any);

      expect(result).toEqual({ id: DUMMY_CERTIFICATE_ID });
      expect(service.getCertificateByUser).toBeCalledWith(1);
    });

    /**
     * Menguji kasus gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { userId: 1 } };
      service.getCertificateByUser.mockRejectedValue(new Error('error'));

      await expect(controller.getOwn(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint uploadTemplate.
   * Menguji proses upload template PDF sertifikat.
   */
  describe('uploadTemplate', () => {
    /**
     * Menguji kasus sukses upload template PDF.
     */
    it('berhasil upload template PDF', () => {
      /**
       * Tujuan: Memastikan template PDF dapat diupload dengan benar.
       */
      const file = { path: DUMMY_TEMPLATE_PATH };
      const result = controller.uploadTemplate(file as any);
      expect(result).toEqual({
        success: true,
        message: 'Template sertifikat berhasil diunggah.',
      });
    });

    /**
     * Menguji kasus gagal upload jika file tidak diupload.
     */
    it('gagal jika file tidak diupload', () => {
      /**
       * Tujuan: Memastikan error dilempar jika file template tidak ada.
       */
      expect(() => controller.uploadTemplate(undefined as any)).toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian endpoint download sertifikat.
   * Menguji proses download file sertifikat (issued maupun generated).
   */
  describe('download', () => {
    const fs = require('fs');
    let res: any;

    beforeEach(() => {
      /**
       * Reset mock response dan mock fs sebelum setiap pengujian.
       */
      res = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };
      jest.clearAllMocks();
    });

    /**
     * Menguji kasus sukses download file issued.
     */
    it('berhasil download file issued', async () => {
      /**
       * Tujuan: Memastikan file sertifikat yang sudah issued dapat diunduh.
       */
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

    /**
     * Menguji kasus sukses download file generated (belum signed).
     */
    it('berhasil download file generated', async () => {
      /**
       * Tujuan: Memastikan file sertifikat yang masih generated dapat diunduh.
       */
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

    /**
     * Menguji kasus gagal jika sertifikat tidak ditemukan.
     */
    it('gagal jika sertifikat tidak ditemukan', async () => {
      /**
       * Tujuan: Memastikan error NotFoundException dilempar jika sertifikat tidak ada.
       */
      service.getCertificateById.mockResolvedValue(null);

      await expect(
        controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res),
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * Menguji kasus gagal jika status sertifikat tidak valid.
     */
    it('gagal jika status sertifikat tidak valid', async () => {
      /**
       * Tujuan: Memastikan error BadRequestException dilempar jika status tidak sesuai.
       */
      service.getCertificateById.mockResolvedValue({
        id: DUMMY_CERTIFICATE_ID,
        status: 'other',
      });

      await expect(
        controller.download(DUMMY_CERTIFICATE_ID, { user: {} } as any, res),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji kasus gagal jika file tidak ditemukan di server.
     */
    it('gagal jika file tidak ditemukan di server', async () => {
      /**
       * Tujuan: Memastikan error NotFoundException dilempar jika file tidak ada di server.
       */
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
   * Menguji pengecekan ketersediaan template sertifikat.
   */
  describe('checkTemplate', () => {
    const fs = require('fs');

    /**
     * Menguji kasus template tersedia.
     */
    it('mengembalikan status template tersedia', () => {
      /**
       * Tujuan: Memastikan status template tersedia dikembalikan dengan benar.
       */
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = controller.checkTemplate();
      expect(result).toEqual({
        templateExists: true,
        templatePath:
          './uploads/certificate-templates/certificate-template.pdf',
      });
    });

    /**
     * Menguji kasus template tidak tersedia.
     */
    it('mengembalikan status template tidak tersedia', () => {
      /**
       * Tujuan: Memastikan status template tidak tersedia dikembalikan dengan benar.
       */
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
   * Menguji proses pengambilan seluruh data sertifikat (khusus admin).
   */
  describe('getAllCertificates', () => {
    /**
     * Menguji kasus sukses mengambil seluruh data sertifikat jika user admin.
     */
    it('berhasil mengambil seluruh data sertifikat jika user admin', async () => {
      /**
       * Tujuan: Memastikan admin dapat mengambil seluruh data sertifikat.
       */
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      service.getAllCertificates.mockResolvedValue([
        { id: DUMMY_CERTIFICATE_ID },
      ]);

      const result = await controller.getAllCertificates(req as any);

      expect(result).toEqual([{ id: DUMMY_CERTIFICATE_ID }]);
      expect(service.getAllCertificates).toBeCalled();
    });

    /**
     * Menguji kasus gagal jika user bukan admin.
     */
    it('gagal jika user bukan admin', async () => {
      /**
       * Tujuan: Memastikan ForbiddenException dilempar jika user bukan admin.
       */
      const req = { user: { role: DUMMY_INTERN_ROLE } };
      await expect(controller.getAllCertificates(req as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    /**
     * Menguji kasus gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error dari service diteruskan dengan benar.
       */
      const req = { user: { role: DUMMY_ADMIN_ROLE } };
      service.getAllCertificates.mockRejectedValue(new Error('error'));

      await expect(controller.getAllCertificates(req as any)).rejects.toThrow(
        'error',
      );
    });
  });
});
