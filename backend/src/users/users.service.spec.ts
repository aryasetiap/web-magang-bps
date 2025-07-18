import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should update educationStatus, activityType, activityStart, activityEnd', async () => {
    prisma.user.findUnique.mockResolvedValue({ profilePhoto: null });
    prisma.user.update.mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 'test@mail.com',
      educationStatus: 'S1',
      activityType: 'Magang',
      activityStart: new Date('2025-07-01'),
      activityEnd: new Date('2025-08-01'),
      role: { name: 'Intern' },
    });

    const dto = {
      educationStatus: 'S1',
      activityType: 'Magang',
      activityStart: new Date('2025-07-01'),
      activityEnd: new Date('2025-08-01'),
    };

    const result = await service.updateProfile(1, dto);
    expect(result.educationStatus).toBe('S1');
    expect(result.activityType).toBe('Magang');
    expect(result.activityStart && new Date(result.activityStart)).toEqual(
      new Date('2025-07-01'),
    );
    expect(result.activityEnd && new Date(result.activityEnd)).toEqual(
      new Date('2025-08-01'),
    );
  });

  it('should get profile with new fields', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Test',
      email: 'test@mail.com',
      educationStatus: 'S1',
      activityType: 'Magang',
      activityStart: new Date('2025-07-01'),
      activityEnd: new Date('2025-08-01'),
      role: { name: 'Intern' },
    });

    const result = await service.getProfile(1);
    expect(result.educationStatus).toBe('S1');
    expect(result.activityType).toBe('Magang');
    expect(result.activityStart && new Date(result.activityStart)).toEqual(
      new Date('2025-07-01'),
    );
    expect(result.activityEnd && new Date(result.activityEnd)).toEqual(
      new Date('2025-08-01'),
    );
  });
});
