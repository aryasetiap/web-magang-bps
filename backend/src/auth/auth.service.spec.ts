import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

/**
 * Pengujian unit untuk AuthService.
 * Meliputi register, login, verifikasi OTP, dan resend OTP.
 */
describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

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

  /**
   * Pengujian fitur register user baru.
   */
  it('register: harus gagal jika role tidak ditemukan', async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    await expect(service.register({ name: 'A', email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow("Role default 'Intern' tidak ditemukan.");
  });

  it('register: harus gagal jika email sudah terdaftar', async () => {
    prisma.role.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.register({ name: 'A', email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email sudah terdaftar.');
  });

  it('register: berhasil mendaftarkan user baru', async () => {
    prisma.role.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.create.mockResolvedValue({
      id: 1, name: 'A', email: 'a@mail.com', role: { name: 'Intern' }
    });
    const result = await service.register({ name: 'A', email: 'a@mail.com', password: '123456' });
    expect(result).toHaveProperty('message');
    expect(result.user).toHaveProperty('id');
    expect(prisma.user.create).toBeCalled();
  });

  /**
   * Pengujian fitur login user.
   */
  it('login: gagal jika user tidak ditemukan', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login({ email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email atau password salah');
  });

  it('login: gagal jika password salah', async () => {
    prisma.user.findUnique.mockResolvedValue({
      email: 'a@mail.com', password: await require('bcrypt').hash('other', 10), role: { name: 'Intern' }
    });
    await expect(service.login({ email: 'a@mail.com', password: '123456' }))
      .rejects.toThrow('Email atau password salah');
  });

  it('login: gagal jika email belum diverifikasi', async () => {
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

  it('login: berhasil login', async () => {
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

  /**
   * Pengujian fitur verifikasi OTP email.
   */
  it('verifyOtp: gagal jika user tidak ditemukan', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('User tidak ditemukan');
  });

  it('verifyOtp: gagal jika sudah diverifikasi', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: true });
    const result = await service.verifyOtp('a@mail.com', '123456');
    expect(result).toEqual({ message: 'Email sudah diverifikasi' });
  });

  it('verifyOtp: gagal jika OTP tidak ditemukan', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: false });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP tidak ditemukan');
  });

  it('verifyOtp: gagal jika OTP salah', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '654321',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP salah');
  });

  it('verifyOtp: gagal jika OTP kadaluarsa', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() - 10000),
    });
    await expect(service.verifyOtp('a@mail.com', '123456')).rejects.toThrow('OTP kadaluarsa');
  });

  it('verifyOtp: berhasil verifikasi OTP', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.verifyOtp('a@mail.com', '123456');
    expect(result).toEqual({ message: 'Email berhasil diverifikasi' });
  });

  /**
   * Pengujian fitur resend OTP email.
   */
  it('resendOtp: gagal jika user tidak ditemukan', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('User tidak ditemukan');
  });

  it('resendOtp: gagal jika sudah diverifikasi', async () => {
    prisma.user.findUnique.mockResolvedValue({ isEmailVerified: true });
    const result = await service.resendOtp('a@mail.com');
    expect(result).toEqual({ message: 'Email sudah diverifikasi' });
  });

  it('resendOtp: gagal jika OTP masih aktif', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: '123456',
      emailOtpExpires: new Date(Date.now() + 10000),
    });
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('OTP masih aktif, silakan cek email Anda.');
  });

  it('resendOtp: gagal jika melebihi rate limit per jam', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: null,
      emailOtpExpires: null,
      lastOtpSentAt: new Date(Date.now() - 30 * 60 * 1000),
    });
    await expect(service.resendOtp('a@mail.com')).rejects.toThrow('Anda hanya dapat meminta OTP sekali per jam.');
  });

  it('resendOtp: berhasil mengirim OTP baru', async () => {
    prisma.user.findUnique.mockResolvedValue({
      isEmailVerified: false,
      emailOtp: null,
      emailOtpExpires: null,
      lastOtpSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.resendOtp('a@mail.com');
    expect(result).toEqual({ message: 'OTP baru telah dikirim ke email Anda.' });
  });
});
