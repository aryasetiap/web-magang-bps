/**
 * Unit test CertificatesService
 * -----------------------------------------------
 * Pengujian seluruh fitur utama CertificatesService, termasuk generate, upload, issue,
 * dan query sertifikat. Setiap pengujian didokumentasikan dengan komentar berbahasa Indonesia.
 */

import { CertificatesService } from '../../src/certificates/certificates.service';
import { CertificateStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from '../../src/certificates/dto/create-certificate.dto';

jest.mock('fs');
jest.mock('pdf-lib', () => {
  const actual = jest.requireActual('pdf-lib');
  return {
    ...actual,
    PDFDocument: {
      load: jest.fn().mockResolvedValue({
        registerFontkit: jest.fn(),
        getPages: jest.fn().mockReturnValue([
          {
            getSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
            drawText: jest.fn(),
          },
        ]),
        embedFont: jest.fn().mockResolvedValue({
          widthOfTextAtSize: jest.fn().mockReturnValue(100),
        }),
        save: jest.fn().mockResolvedValue(Buffer.from('PDFDATA')),
      }),
    },
  };
});
jest.mock('@pdf-lib/fontkit', () => ({}));

import * as fs from 'fs';
import * as path from 'path';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let prisma: any;
  let prismaMock: any;

  beforeEach(() => {
    prisma = {
      certificate: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      finalProject: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    prismaMock = prisma;

    // Mock fs
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('fontdata'));
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

    service = new CertificatesService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Pengujian generateCertificate
   */
  describe('generateCertificate', () => {
    it('berhasil generate sertifikat jika data valid', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Budi',
        namaLengkap: 'Budi Santoso',
        educationStatus: 'S1',
        asalInstitusi: 'ITS',
        activityType: 'Magang',
        activityStart: new Date('2025-07-01'),
        activityEnd: new Date('2025-08-01'),
      });
      prisma.finalProject.findFirst.mockResolvedValue({
        id: 1,
        status: 'accepted',
      });
      prisma.certificate.create.mockResolvedValue({
        id: 1,
        certificateNumber: '123',
      });

      const dto: CreateCertificateDto = {
        certificateNumber: '123/ABC',
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };

      const result = await service.generateCertificate(dto, 99);

      expect(result).toHaveProperty('id', 1);
      expect(prisma.certificate.create).toBeCalled();
      expect(fs.writeFileSync).toBeCalled();
    });

    it('gagal jika intern sudah punya sertifikat', async () => {
      prisma.certificate.findUnique.mockResolvedValue({ id: 1 });
      const dto: CreateCertificateDto = {
        certificateNumber: '123/ABC',
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      await expect(service.generateCertificate(dto, 99)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('gagal jika user tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      const dto: CreateCertificateDto = {
        certificateNumber: '123/ABC',
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      await expect(service.generateCertificate(dto, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('gagal jika final project belum accepted', async () => {
      prismaMock.certificate.findUnique.mockResolvedValue(null);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        activityStart: new Date(),
        activityEnd: new Date(),
      });
      prismaMock.finalProject.findFirst.mockResolvedValue(null);

      await expect(
        service.generateCertificate(
          {
            certificateNumber: '123',
            userId: 1,
            predicate: 'Sangat Baik',
            namaKepalaBPS: 'Kepala',
            nipKepalaBPS: '1234567890',
          },
          99,
        ),
      ).rejects.toThrow('Final project belum accepted.');
    });

    it('gagal jika template sertifikat tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Budi',
        activityStart: new Date('2025-07-01'),
        activityEnd: new Date('2025-08-01'),
      });
      prisma.finalProject.findFirst.mockResolvedValue({
        id: 1,
        status: 'accepted',
      });
      (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
        if (p.includes('certificate-template.pdf')) return false;
        return true;
      });
      const dto: CreateCertificateDto = {
        certificateNumber: '123/ABC',
        userId: 1,
        predicate: 'Sangat Baik',
        namaKepalaBPS: 'Kepala',
        nipKepalaBPS: '1234567890',
      };
      await expect(service.generateCertificate(dto, 99)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /**
   * Pengujian uploadSignedCertificate
   */
  describe('uploadSignedCertificate', () => {
    it('berhasil upload file signed jika status generated', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        id: 1,
        status: CertificateStatus.generated,
      });
      prisma.certificate.update.mockResolvedValue({
        id: 1,
        status: CertificateStatus.signed,
      });

      const result = await service.uploadSignedCertificate(1, 'signed.pdf', 99);

      expect(result).toHaveProperty('status', CertificateStatus.signed);
      expect(prisma.certificate.update).toBeCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          signedFilePath: 'signed.pdf',
          status: CertificateStatus.signed,
          updatedBy: 99,
        }),
      });
    });

    it('gagal jika sertifikat tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      await expect(
        service.uploadSignedCertificate(1, 'signed.pdf', 99),
      ).rejects.toThrow(NotFoundException);
    });

    it('gagal jika status sertifikat bukan generated', async () => {
      prismaMock.certificate.findUnique.mockResolvedValue({
        id: 1,
        status: 'issued',
      });

      await expect(
        service.uploadSignedCertificate(1, 'signed.pdf', 99),
      ).rejects.toThrow('Sertifikat harus status generated.');
    });
  });

  /**
   * Pengujian issueCertificate
   */
  describe('issueCertificate', () => {
    it('berhasil issue sertifikat jika status signed', async () => {
      prisma.certificate.findUnique.mockResolvedValue({
        id: 1,
        status: CertificateStatus.signed,
        userId: 2,
      });
      prisma.$transaction.mockResolvedValue([
        { id: 1, status: CertificateStatus.issued },
        { id: 2, isGraduated: true },
      ]);

      const result = await service.issueCertificate(1, 99);

      expect(result).toHaveProperty('status', CertificateStatus.issued);
      expect(prisma.$transaction).toBeCalled();
    });

    it('gagal jika sertifikat tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      await expect(service.issueCertificate(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('gagal jika status sertifikat bukan signed', async () => {
      prismaMock.certificate.findUnique.mockResolvedValue({
        id: 1,
        status: 'generated',
        userId: 2,
      });

      await expect(service.issueCertificate(1, 99)).rejects.toThrow(
        'Sertifikat harus status signed.',
      );
    });
  });

  /**
   * Pengujian getCertificateByUser
   */
  describe('getCertificateByUser', () => {
    it('mengembalikan data sertifikat jika ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue({ id: 1 });
      const result = await service.getCertificateByUser(1);
      expect(result).toHaveProperty('id', 1);
      expect(prisma.certificate.findUnique).toBeCalledWith({
        where: { userId: 1 },
      });
    });

    it('mengembalikan null jika tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      const result = await service.getCertificateByUser(1);
      expect(result).toBeNull();
    });
  });

  /**
   * Pengujian getCertificateById
   */
  describe('getCertificateById', () => {
    it('mengembalikan data sertifikat jika ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue({ id: 1 });
      const result = await service.getCertificateById(1);
      expect(result).toHaveProperty('id', 1);
      expect(prisma.certificate.findUnique).toBeCalledWith({
        where: { id: 1 },
      });
    });

    it('mengembalikan null jika tidak ditemukan', async () => {
      prisma.certificate.findUnique.mockResolvedValue(null);
      const result = await service.getCertificateById(1);
      expect(result).toBeNull();
    });
  });

  /**
   * Pengujian getAllCertificates
   */
  describe('getAllCertificates', () => {
    it('mengembalikan array sertifikat beserta user', async () => {
      prisma.certificate.findMany.mockResolvedValue([
        { id: 1, user: { id: 2, name: 'Budi' } },
      ]);
      const result = await service.getAllCertificates();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('user');
      expect(prisma.certificate.findMany).toBeCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              namaLengkap: true,
              asalInstitusi: true,
              isGraduated: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
