import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      verifyOtp: jest.fn(),
      resendOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: { getProfile: jest.fn(), updateProfile: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register: should call service and return result', async () => {
    const dto = { name: 'A', email: 'a@mail.com', password: '123456' };
    const mockResult = { message: 'ok', user: { id: 1 } };
    authService.register.mockResolvedValue(mockResult);
    const result = await controller.register(dto as any);
    expect(result).toEqual(mockResult);
    expect(authService.register).toBeCalledWith(dto);
  });

  it('login: should call service and return formatted result', async () => {
    const dto = { email: 'a@mail.com', password: '123456' };
    const mockResult = {
      access_token: 'token',
      user: { id: 1, name: 'A', email: 'a@mail.com', role: { name: 'Intern' } },
    };
    authService.login.mockResolvedValue(mockResult);
    const result = await controller.login(dto as any);
    expect(result).toEqual({
      access_token: 'token',
      user: {
        id: 1,
        name: 'A',
        email: 'a@mail.com',
        role: { name: 'Intern' },
      },
    });
    expect(authService.login).toBeCalledWith(dto);
  });

  it('verifyOtp: should call service and return result', async () => {
    const body = { email: 'a@mail.com', otp: '123456' };
    const mockResult = { message: 'Email berhasil diverifikasi' };
    authService.verifyOtp.mockResolvedValue(mockResult);
    const result = await controller.verifyOtp(body);
    expect(result).toEqual(mockResult);
    expect(authService.verifyOtp).toBeCalledWith(body.email, body.otp);
  });

  it('resendOtp: should call service and return result', async () => {
    const body = { email: 'a@mail.com' };
    const mockResult = { message: 'OTP baru telah dikirim ke email Anda.' };
    authService.resendOtp.mockResolvedValue(mockResult);
    const result = await controller.resendOtp(body);
    expect(result).toEqual(mockResult);
    expect(authService.resendOtp).toBeCalledWith(body.email);
  });
});