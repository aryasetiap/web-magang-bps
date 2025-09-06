import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsService } from './final-projects.service';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Pengujian unit untuk FinalProjectsService.
 *
 * Suite ini memastikan bahwa service FinalProjectsService dapat diinisialisasi dengan benar.
 */
describe('FinalProjectsService', () => {
  let service: FinalProjectsService;
  let prisma: any;

  /**
   * Inisialisasi modul pengujian dan instance FinalProjectsService sebelum setiap pengujian dijalankan.
   */
  beforeEach(async () => {
    prisma = {
      finalProject: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalProjectsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FinalProjectsService>(FinalProjectsService);
  });

  /**
   * Menguji apakah instance FinalProjectsService berhasil didefinisikan.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow update even if status is accepted', async () => {
    const mockProject = {
      id: 1,
      userId: 1,
      status: 'accepted',
      filePath: null,
    };
    prisma.finalProject.findUnique.mockResolvedValue(mockProject);
    prisma.finalProject.update.mockResolvedValue({
      ...mockProject,
      title: 'Updated',
    });

    const result = await service.update(1, 1, { title: 'Updated' }, undefined);
    expect(result.title).toBe('Updated');
    expect(prisma.finalProject.update).toHaveBeenCalled();
  });
});
