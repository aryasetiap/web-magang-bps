import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from './attendances.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AttendanceStatus } from '@prisma/client';
import { RequestLeaveDto, LeaveType } from './dto/request-leave.dto';
import MockDate from 'mockdate';

describe('AttendancesService', () => {
  let service: AttendancesService;

  beforeEach(async () => {
    const prismaAttendanceMock = {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const prismaUserMock = {
      findMany: jest.fn(),
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

    // Attach mocks for easier access in tests
    (service as any).prisma.attendance = prismaAttendanceMock;
    (service as any).prisma.user = prismaUserMock;
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestLeave', () => {
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

  describe('validateLeave', () => {
    it('should throw error if status invalid', async () => {
      await expect(
        service.validateLeave(1, 'invalid' as any, 99),
      ).rejects.toThrow('Status tidak valid');
    });

    it('should update attendance status', async () => {
      (service as any).prisma.attendance.update.mockResolvedValueOnce({
        id: 1,
        status: AttendanceStatus.sakit,
      });
      const result = await service.validateLeave(1, AttendanceStatus.sakit, 99);
      expect(result).toHaveProperty('status', AttendanceStatus.sakit);
    });
  });
});
