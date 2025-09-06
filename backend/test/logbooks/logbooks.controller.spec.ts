import { Test, TestingModule } from '@nestjs/testing';
import { LogbooksController } from './logbooks.controller';
import { LogbooksService } from './logbooks.service';
import { Response } from 'express';

describe('LogbooksController', () => {
  let controller: LogbooksController;
  let service: LogbooksService;

  beforeEach(async () => {
    const mockService = {
      exportUserLogbookReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogbooksController],
      providers: [{ provide: LogbooksService, useValue: mockService }],
    }).compile();

    controller = module.get<LogbooksController>(LogbooksController);
    service = module.get<LogbooksService>(LogbooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportUserLogbookReport', () => {
    it('should call service and send PDF buffer', async () => {
      const userId = 1;
      const startDate = '2025-07-01';
      const endDate = '2025-07-31';
      const pdfBuffer = Buffer.from('PDFDATA');
      const req = { user: { name: 'Admin' } };

      // Mock service
      (service.exportUserLogbookReport as jest.Mock).mockResolvedValue(
        pdfBuffer,
      );

      // Mock Express Response
      const res = {
        set: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      await controller.exportUserLogbookReport(
        userId,
        startDate,
        endDate,
        req,
        res,
      );

      expect(service.exportUserLogbookReport).toHaveBeenCalledWith(
        userId,
        { startDate, endDate },
        'Admin',
      );
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="logbook-intern-${userId}.pdf"`,
      });
      expect(res.end).toHaveBeenCalledWith(pdfBuffer);
    });
  });
});
