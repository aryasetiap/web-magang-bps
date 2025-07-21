import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: { user: {}, role: {} } },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mocked-jwt') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    prisma.user = {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    prisma.role = {
      findUnique: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // REGISTER
  it('register: should throw if role not found', async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    await expect(service.register({ name: 'A', email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow("Role default 'Intern' tidak ditemukan.");
  });

  it('register: should throw if email duplicate', async () => {
    prisma.role.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.register({ name: 'A', email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email sudah terdaftar.');
  });

  it('register: should succeed', async () => {
    prisma.role.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.create.mockResolvedValue({
      id: 1, name: 'A', email: 'a@mail.com', role: { name: 'Intern' }
    });
    const result = await service.register({ name: 'A', email: 'a@mail.com', password: '123456' });
    expect(result).toHaveProperty('message');
    expect(result.user).toHaveProperty('id');
    expect(prisma.user.create).toBeCalled();
  });

  // LOGIN
  it('login: should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login({ email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email atau password salah');
  });

  it('login: should throw if password invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'a@mail.com', password: await require('bcrypt').hash('other', 10), role: { name: 'Intern' }
    });
    await expect(service.login({ email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email atau password salah');
  });

  it('login: should throw if email not verified', async () => {
    const bcrypt = require('bcrypt');
    prisma.user.findUnique.mockResolvedValue({
      email: 'a@mail.com',
      password: await bcrypt.hash('123456', 10),
      isEmailVerified: false,
      role: { name: 'Intern' }
    });
    await expect(service.login({ email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email belum diverifikasi. Silakan cek email Anda.');
  });

  it('login: should succeed', async () => {
    const bcrypt = require('bcrypt');
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'A',
      email: 'a@mail.com',
      password: await bcrypt.hash('123456', 10),
      isEmailVerified: true,
      role: { name: 'Intern' }
    });
    const result = await service.login({ email: 'a@mail.com', password: '123456' });
    expect(result).toHaveProperty('access_token');
    expect(result.user).toHaveProperty('id');
  });

  // VERIFY OTP
  it('verifyOtp: should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('User tidak ditemukan');
  });

  it('verifyOtp: should throw if already verified', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: true });
    const result = await service.verifyOtp('a@mail.com', '123456');
    expect(result).toEqual({ message: 'Email sudah diverifikasi' });
  });

  it('verifyOtp: should throw if OTP not found', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: false });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP tidak ditemukan');
  });

  it('verifyOtp: should throw if OTP salah', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '654321',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP salah');
  });

  it('verifyOtp: should throw if OTP kadaluarsa', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() - 10000),
    });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP kadaluarsa');
  });

  it('verifyOtp: should succeed', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.verifyOtp('a@mail.com', '123456');
    expect(result).toEqual({ message: 'Email berhasil diverifikasi' });
  });

  // RESEND OTP
  it('resendOtp: should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('User tidak ditemukan');
  });

  it('resendOtp: should throw if already verified', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: true });
    const result = await service.resendOtp('a@mail.com');
    expect(result).toEqual({ message: 'Email sudah diverifikasi' });
  });

  it('resendOtp: should throw if OTP masih aktif', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('OTP masih aktif, silakan cek email Anda.');
  });

  it('resendOtp: should throw if rate limit per jam', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: null,
      emailOtpExpires: null,
      lastOtpSentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 menit lalu
    });
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('Anda hanya dapat meminta OTP sekali per jam.');
  });

  it('resendOtp: should succeed', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: null,
      emailOtpExpires: null,
      lastOtpSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 jam lalu
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.resendOtp('a@mail.com');
    expect(result).toEqual({ message: 'OTP baru telah dikirim ke email Anda.' });
  });
});
