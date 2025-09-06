import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { LeaveType } from './dto/request-leave.dto';

/**
 * Unit tests for AttendancesController.
 * Mocks AttendancesService and verifies controller methods.
 */
describe('AttendancesController', () => {
  let controller: AttendancesController;
  let service: AttendancesService;

  beforeEach(async () => {
    const serviceMock = {
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      requestLeave: jest.fn(),
      validateLeave: jest.fn(),
      findAll: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      exportAllAttendancesPdf: jest.fn(),
      exportUserAttendancePdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [
        {
          provide: AttendancesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<AttendancesController>(AttendancesController);
    service = module.get<AttendancesService>(AttendancesService);
  });

  /**
   * Test controller definition.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Test clockIn method.
   */
  it('should call clockIn', async () => {
    (service.clockIn as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const req = { user: { userId: 1 } };
    const result = await controller.clockIn(
      req,
      { latitude: 1, longitude: 1 },
      '127.0.0.1',
    );
    expect(result).toHaveProperty('id', 1);
  });

  /**
   * Test requestLeave method.
   */
  it('should call requestLeave', async () => {
    (service.requestLeave as jest.Mock).mockResolvedValueOnce({ id: 2 });
    const req = { user: { userId: 1 } };
    const result = await controller.requestLeave(
      req,
      { type: LeaveType.izin, description: 'Alasan' },
      { path: 'file.pdf' } as any,
    );
    expect(result).toHaveProperty('id', 2);
  });

  /**
   * Test validateLeave method.
   */
  it('should call validateLeave', async () => {
    (service.validateLeave as jest.Mock).mockResolvedValueOnce({
      id: 2,
      status: 'izin',
    });
    const req = { user: { userId: 99 } };
    const result = await controller.validateLeave('2', 'izin', req);
    expect(result).toHaveProperty('status', 'izin');
  });

  /**
   * Test exportAllAttendancesPdf endpoint.
   */
  it('should export all attendances PDF', async () => {
    (service.exportAllAttendancesPdf as jest.Mock).mockResolvedValueOnce(
      Buffer.from('PDFDATA'),
    );
    const req = { user: { name: 'Admin' } };
    const res = { set: jest.fn(), end: jest.fn() } as any;
    await controller.exportAllAttendancesPdf(
      '2025-07-01',
      '2025-07-31',
      'ITS',
      res,
      req,
    );
    expect(service.exportAllAttendancesPdf).toHaveBeenCalledWith(
      { startDate: '2025-07-01', endDate: '2025-07-31', institution: 'ITS' },
      'Admin',
    );
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/pdf' }),
    );
    expect(res.end).toHaveBeenCalledWith(Buffer.from('PDFDATA'));
  });

  /**
   * Test exportUserAttendancePdf endpoint.
   */
  it('should export user attendance PDF', async () => {
    (service.exportUserAttendancePdf as jest.Mock).mockResolvedValueOnce(
      Buffer.from('PDFDATA'),
    );
    const req = { user: { name: 'Admin' } };
    const res = { set: jest.fn(), end: jest.fn() } as any;
    await controller.exportUserAttendancePdf(
      '123',
      '2025-07-01',
      '2025-07-31',
      res,
      req,
    );
    expect(service.exportUserAttendancePdf).toHaveBeenCalledWith(
      123,
      { startDate: '2025-07-01', endDate: '2025-07-31' },
      'Admin',
    );
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/pdf' }),
    );
    expect(res.end).toHaveBeenCalledWith(Buffer.from('PDFDATA'));
  });
});
