import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from './attendances.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AttendanceStatus } from '@prisma/client';
import { RequestLeaveDto, LeaveType } from './dto/request-leave.dto';
import MockDate from 'mockdate';

/**
 * Unit test suite for AttendancesService.
 */
describe('AttendancesService', () => {
  let service: AttendancesService;

  beforeEach(async () => {
    const prismaAttendanceMock = {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };
    const prismaUserMock = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        {
          provide: PrismaService,
          useValue: {
            attendance: prismaAttendanceMock,
            user: prismaUserMock,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('1'),
          },
        },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
    (service as any).prisma.attendance = prismaAttendanceMock;
    (service as any).prisma.user = prismaUserMock;
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test cases for requestLeave method.
   */
  describe('requestLeave', () => {
    /**
     * Should throw error if leave requested after 11:00 WIB.
     */
    it('should throw error if after 11:00 WIB', async () => {
      MockDate.set('2025-07-18T04:30:00Z'); // 11:30 WIB
      await expect(
        service.requestLeave(
          1,
          { type: LeaveType.izin, description: 'Alasan' },
          { path: 'file.pdf' } as any,
        ),
      ).rejects.toThrow(
        'Pengajuan hanya bisa dilakukan sebelum pukul 11.00 WIB',
      );
    });

    /**
     * Should throw error if supporting file is not uploaded.
     */
    it('should throw error if file not uploaded', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      await expect(
        service.requestLeave(
          1,
          { type: LeaveType.izin, description: 'Alasan' },
          null,
        ),
      ).rejects.toThrow('Bukti pendukung wajib diunggah');
    });

    /**
     * Should throw error if leave already submitted today.
     */
    it('should throw error if already submitted today', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      (service as any).prisma.attendance.findFirst.mockResolvedValueOnce({
        id: 1,
      });
      await expect(
        service.requestLeave(
          1,
          { type: LeaveType.izin, description: 'Alasan' },
          { path: 'file.pdf' } as any,
        ),
      ).rejects.toThrow('Anda sudah mengajukan presensi hari ini');
    });

    /**
     * Should create attendance record for izin/sakit.
     */
    it('should create attendance for izin/sakit', async () => {
      MockDate.set('2025-07-18T02:00:00Z'); // 09:00 WIB
      (service as any).prisma.attendance.findFirst.mockResolvedValueOnce(null);
      (service as any).prisma.attendance.create.mockResolvedValueOnce({
        id: 2,
        status: AttendanceStatus.izin,
      });
      const result = await service.requestLeave(
        1,
        { type: LeaveType.izin, description: 'Alasan' },
        { path: 'file.pdf' } as any,
      );
      expect(result).toHaveProperty('id', 2);
      expect(result).toHaveProperty('status', AttendanceStatus.izin);
    });
  });

  /**
   * Test cases for validateLeave method.
   */
  describe('validateLeave', () => {
    /**
     * Should throw error if status is invalid.
     */
    it('should throw error if status invalid', async () => {
      await expect(
        service.validateLeave(1, 'invalid' as any, 99),
      ).rejects.toThrow('Status tidak valid');
    });

    /**
     * Should update attendance status.
     */
    it('should update attendance status', async () => {
      (service as any).prisma.attendance.update.mockResolvedValueOnce({
        id: 1,
        status: AttendanceStatus.sakit,
      });
      const result = await service.validateLeave(1, AttendanceStatus.sakit, 99);
      expect(result).toHaveProperty('status', AttendanceStatus.sakit);
    });
  });

  /**
   * Test exportAllAttendancesPdf
   */
  it('should generate PDF buffer for all attendances', async () => {
    (service as any).prisma.attendance.findMany.mockResolvedValueOnce([
      {
        user: { name: 'Budi', asalInstitusi: 'ITS' },
        clockIn: new Date('2025-07-01T08:00:00Z'),
        clockOut: new Date('2025-07-01T16:00:00Z'),
        status: 'hadir',
        reasonDescription: '',
        validatedBy: 99,
      },
    ]);
    const buffer = await service.exportAllAttendancesPdf(
      { startDate: '2025-07-01', endDate: '2025-07-31', institution: 'ITS' },
      'Admin',
    );
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  /**
   * Test exportUserAttendancePdf
   */
  it('should generate PDF buffer for user attendance', async () => {
    (service as any).prisma.attendance.findMany.mockResolvedValueOnce([
      {
        clockIn: new Date('2025-07-01T08:00:00Z'),
        clockOut: new Date('2025-07-01T16:00:00Z'),
        status: 'hadir',
        reasonDescription: '',
        validatedBy: 99,
      },
    ]);
    (service as any).prisma.user.findUnique.mockResolvedValueOnce({
      name: 'Budi',
      asalInstitusi: 'ITS',
    });
    const buffer = await service.exportUserAttendancePdf(
      123,
      { startDate: '2025-07-01', endDate: '2025-07-31' },
      'Admin',
    );
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
