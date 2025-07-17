import { Test, TestingModule } from '@nestjs/testing';
import { InternshipApplicationsService } from './internship-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

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

  it('should throw error if transcript is missing', async () => {
    const files = {
      requestLetter: [mockFile('requestLetter.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw error if requestLetter is missing', async () => {
    const files = {
      transcript: [mockFile('transcript.pdf')],
    };
    const dto = { startDate: '2025-08-01', endDate: '2025-09-01' };

    await expect(service.create(1, dto, files)).rejects.toThrow(
      BadRequestException,
    );
  });

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
});
