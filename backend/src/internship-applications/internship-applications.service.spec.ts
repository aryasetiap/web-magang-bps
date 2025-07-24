import * as fs from 'fs';
import { Test, TestingModule } from '@nestjs/testing';
import { InternshipApplicationsService } from './internship-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

/**
 * Membuat objek file tiruan untuk kebutuhan pengujian.
 * @param path - Nama file yang akan digunakan sebagai mock.
 * @returns Objek file tiruan sesuai struktur Express.Multer.File.
 */
function mockFile(path: string): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: path,
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1000,
    destination: './uploads',
    filename: path,
    path,
    buffer: Buffer.from(''),
    stream: undefined as any,
  };
}

describe('InternshipApplicationsService', () => {
  let service: InternshipApplicationsService;
  let prisma: any;

  /**
   * Inisialisasi modul pengujian dan mock PrismaService sebelum setiap pengujian.
   */
  beforeEach(async () => {
    prisma = {
      internshipApplication: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternshipApplicationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InternshipApplicationsService>(
      InternshipApplicationsService,
    );
  });

  /**
   * Menguji bahwa pengajuan magang dapat dilakukan tanpa melampirkan CV.
   */
  it('should allow submission without CV', async () => {
    prisma.internshipApplication.findUnique.mockResolvedValue(null);
    prisma.internshipApplication.create.mockResolvedValue({ id: 1 });

    const files = {
      transcript: [mockFile('transcript.pdf')],
      requestLetter: [mockFile('requestLetter.pdf')],
    };

    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).resolves.toEqual({ id: 1 });
  });

  /**
   * Menguji bahwa error dilempar jika file transcript tidak dilampirkan.
   */
  it('should throw error if transcript is missing', async () => {
    const files = {
      requestLetter: [mockFile('requestLetter.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      BadRequestException,
    );
  });

  /**
   * Menguji bahwa error dilempar jika file requestLetter tidak dilampirkan.
   */
  it('should throw error if requestLetter is missing', async () => {
    const files = {
      transcript: [mockFile('transcript.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      BadRequestException,
    );
  });

  /**
   * Menguji bahwa pengajuan magang dapat dilakukan dengan melampirkan CV.
   */
  it('should allow submission with CV', async () => {
    prisma.internshipApplication.findUnique.mockResolvedValue(null);
    prisma.internshipApplication.create.mockResolvedValue({ id: 2 });

    const files = {
      cv: [mockFile('cv.pdf')],
      transcript: [mockFile('transcript.pdf')],
      requestLetter: [mockFile('requestLetter.pdf')],
    };

    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(2, dto, files)).resolves.toEqual({ id: 2 });
  });

  /**
   * Menguji bahwa user tidak bisa mengajukan ulang jika status pengajuan sebelumnya masih 'pending'.
   */
  it('should not allow resubmission if previous application is still pending', async () => {
    prisma.internshipApplication.findUnique.mockResolvedValue({
      id: 10,
      status: 'pending',
    });

    const files = {
      transcript: [mockFile('transcript.pdf')],
      requestLetter: [mockFile('requestLetter.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      ConflictException,
    );
  });

  /**
   * Menguji bahwa user tidak bisa mengajukan ulang jika status pengajuan sebelumnya sudah 'diterima'.
   */
  it('should not allow resubmission if previous application is already accepted', async () => {
    prisma.internshipApplication.findUnique.mockResolvedValue({
      id: 11,
      status: 'diterima',
    });

    const files = {
      transcript: [mockFile('transcript.pdf')],
      requestLetter: [mockFile('requestLetter.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      ConflictException,
    );
  });

  /**
   * Menguji bahwa user bisa mengajukan ulang jika status pengajuan sebelumnya 'ditolak'.
   */
  it('should allow resubmission if previous application was rejected', async () => {
    prisma.internshipApplication.findUnique.mockResolvedValue({
      id: 12,
      status: 'ditolak',
    });
    prisma.internshipApplication.create.mockResolvedValue({ id: 3 });

    const files = {
      transcript: [mockFile('transcript.pdf')],
      requestLetter: [mockFile('requestLetter.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).resolves.toEqual({ id: 3 });
  });
});
