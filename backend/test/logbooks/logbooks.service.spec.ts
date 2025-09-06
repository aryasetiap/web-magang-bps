import { LogbooksService } from './logbooks.service';

describe('LogbooksService', () => {
  let service: LogbooksService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      logbook: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    service = new LogbooksService(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportUserLogbookReport', () => {
    it('should generate PDF buffer for user logbook', async () => {
      const userId = 1;
      const filter = { startDate: '2025-07-01', endDate: '2025-07-31' };
      const adminName = 'Admin';

      prismaMock.logbook.findMany.mockResolvedValue([
        {
          id: 1,
          logDate: new Date('2025-07-10'),
          status: 'draft',
          content: 'Aktivitas 1',
        },
        {
          id: 2,
          logDate: new Date('2025-07-11'),
          status: 'submitted',
          content: 'Aktivitas 2',
        },
      ]);
      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'Budi',
        asalInstitusi: 'ITS',
      });

      const buffer = await service.exportUserLogbookReport(
        userId,
        filter,
        adminName,
      );

      expect(prismaMock.logbook.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          logDate: {
            gte: new Date(filter.startDate),
            lte: new Date(filter.endDate),
          },
        },
        orderBy: { logDate: 'asc' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
