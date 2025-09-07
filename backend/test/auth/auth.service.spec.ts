/**
 * Unit Test AuthService
 * -----------------------------------------
 * Pengujian seluruh fitur utama AuthService, termasuk registrasi, login, Google login,
 * ganti password, lupa password, verifikasi OTP, dan pengiriman email OTP.
 * Setiap pengujian didokumentasikan dengan docstring berbahasa Indonesia.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

jest.mock('bcrypt');
jest.mock('nodemailer');

// Konstanta untuk test
const TEST_EMAIL = 'test@mail.com';
const TEST_PASSWORD = 'password123';
const TEST_OTP = '123456';
const TEST_JWT = 'jwt-token';
const TEST_ROLE = { id: 1, name: 'Intern' };
const OTP_EXPIRY = () => new Date(Date.now() + 600000);
const OTP_EXPIRED = () => new Date(Date.now() - 60000);

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  /**
   * Setup dan teardown untuk setiap pengujian.
   * Membuat mock PrismaService dan JwtService.
   */
  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
    };
    jwt = {
      sign: jest.fn().mockReturnValue(TEST_JWT),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Pengujian fitur registrasi user baru.
   */
  describe('register', () => {
    /**
     * Menguji registrasi user baru berhasil jika data valid.
     */
    it('berhasil registrasi user baru', async () => {
      prisma.role.findUnique.mockResolvedValue(TEST_ROLE);
      prisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: TEST_EMAIL,
        role: TEST_ROLE,
      });
      jest.spyOn(service as any, 'generateOtp').mockReturnValue(TEST_OTP);
      jest
        .spyOn(service as any, 'generateOtpExpiry')
        .mockReturnValue(OTP_EXPIRY());
      jest.spyOn(service as any, 'sendOtpEmail').mockResolvedValue(undefined);

      const result = await service.register({
        name: 'Test',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(result).toHaveProperty('message');
      expect(result.user).toHaveProperty('email', TEST_EMAIL);
      expect(prisma.user.create).toBeCalled();
    });

    /**
     * Menguji gagal registrasi jika role default tidak ditemukan.
     */
    it('gagal jika role default tidak ditemukan', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.register({
          name: 'Test',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    /**
     * Menguji gagal registrasi jika email sudah terdaftar (P2002).
     */
    it('gagal jika email sudah terdaftar (P2002)', async () => {
      prisma.role.findUnique.mockResolvedValue(TEST_ROLE);
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          name: 'Test',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(ConflictException);
    });

    /**
     * Menguji gagal registrasi jika terjadi error lain pada database.
     */
    it('gagal jika terjadi error lain', async () => {
      prisma.role.findUnique.mockResolvedValue(TEST_ROLE);
      prisma.user.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.register({
          name: 'Test',
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Pengujian fitur login user.
   */
  describe('login', () => {
    /**
     * Menguji login berhasil jika email, password valid, dan email terverifikasi.
     */
    it('berhasil login jika email dan password valid serta email terverifikasi', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: TEST_EMAIL,
        password: 'hashed',
        isEmailVerified: true,
        role: TEST_ROLE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(result).toHaveProperty('access_token', TEST_JWT);
      expect(result.user).toHaveProperty('email', TEST_EMAIL);
    });

    /**
     * Menguji gagal login jika user tidak ditemukan.
     */
    it('gagal login jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@mail.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal login jika password salah.
     */
    it('gagal login jika password salah', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: TEST_EMAIL,
        password: 'hashed',
        isEmailVerified: true,
        role: TEST_ROLE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: TEST_EMAIL, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal login jika email belum diverifikasi.
     */
    it('gagal login jika email belum diverifikasi', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test',
        email: TEST_EMAIL,
        password: 'hashed',
        isEmailVerified: false,
        role: TEST_ROLE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  /**
   * Pengujian fitur login/registrasi Google.
   */
  describe('googleLogin', () => {
    /**
     * Menguji login Google berhasil jika user valid.
     */
    it('berhasil login dengan Google jika user valid', async () => {
      const googleUser = {
        email: TEST_EMAIL,
        firstName: 'Test',
        lastName: 'User',
      };
      jest.spyOn(service, 'validateGoogleUser').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: TEST_EMAIL,
        password: 'hashed',
        profilePhoto: null,
        namaLengkap: null,
        nimNisn: null,
        asalInstitusi: null,
        jurusanProdi: null,
        nomorTelepon: null,
        alamat: null,
        educationStatus: null,
        activityType: null,
        activityStart: null,
        activityEnd: null,
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpires: null,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
        lastOtpSentAt: null,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isGraduated: false,
        role: TEST_ROLE,
      });

      const result = await service.googleLogin(googleUser as any);

      expect(result).toHaveProperty('access_token', TEST_JWT);
      expect(result.user).toHaveProperty('email', TEST_EMAIL);
    });

    /**
     * Menguji gagal login Google jika data user tidak valid.
     */
    it('gagal jika data user Google tidak valid', async () => {
      await expect(service.googleLogin(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Pengujian fitur ganti password.
   */
  describe('changePassword', () => {
    /**
     * Menguji ganti password berhasil jika user dan password lama valid.
     */
    it('berhasil ganti password jika user dan password lama valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      prisma.user.update.mockResolvedValue({});

      const result = await service.changePassword(1, 'oldpass', 'newpass123');
      expect(result).toHaveProperty('message');
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Menguji gagal ganti password jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(1, 'old', 'new')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal ganti password jika password lama salah.
     */
    it('gagal jika password lama salah', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, 'wrong', 'new')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal ganti password jika password baru sama dengan lama.
     */
    it('gagal jika password baru sama dengan lama', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.changePassword(1, 'same', 'same')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Pengujian fitur lupa password.
   */
  describe('forgotPassword', () => {
    /**
     * Menguji berhasil mengirim OTP reset password jika user valid dan OTP belum aktif.
     */
    it('berhasil mengirim OTP reset password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtpExpires: OTP_EXPIRED(),
      });
      prisma.user.update.mockResolvedValue({});
      jest.spyOn(service as any, 'generateOtp').mockReturnValue(TEST_OTP);
      jest
        .spyOn(service as any, 'generateOtpExpiry')
        .mockReturnValue(OTP_EXPIRY());
      jest.spyOn(service as any, 'sendOtpEmail').mockResolvedValue(undefined);

      const result = await service.forgotPassword(TEST_EMAIL);
      expect(result).toHaveProperty('message');
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Menguji gagal lupa password jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.forgotPassword('notfound@mail.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal lupa password jika OTP masih aktif.
     */
    it('gagal jika OTP masih aktif', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtpExpires: OTP_EXPIRY(),
      });

      await expect(service.forgotPassword(TEST_EMAIL)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Pengujian fitur verifikasi reset password.
   */
  describe('verifyResetPassword', () => {
    /**
     * Menguji berhasil verifikasi OTP dan reset password.
     */
    it('berhasil verifikasi dan reset password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtp: TEST_OTP,
        resetPasswordOtpExpires: OTP_EXPIRY(),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      prisma.user.update.mockResolvedValue({});

      const result = await service.verifyResetPassword(
        TEST_EMAIL,
        TEST_OTP,
        'newpass123',
      );
      expect(result).toHaveProperty('message');
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Menguji gagal verifikasi reset password jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyResetPassword('notfound@mail.com', '123', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal verifikasi reset password jika OTP tidak ada.
     */
    it('gagal jika OTP tidak ada', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
      });

      await expect(
        service.verifyResetPassword(TEST_EMAIL, '123', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal verifikasi reset password jika OTP salah.
     */
    it('gagal jika OTP salah', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtp: '654321',
        resetPasswordOtpExpires: OTP_EXPIRY(),
      });

      await expect(
        service.verifyResetPassword(TEST_EMAIL, TEST_OTP, 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal verifikasi reset password jika OTP kadaluarsa.
     */
    it('gagal jika OTP kadaluarsa', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        resetPasswordOtp: TEST_OTP,
        resetPasswordOtpExpires: OTP_EXPIRED(),
      });

      await expect(
        service.verifyResetPassword(TEST_EMAIL, TEST_OTP, 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  /**
   * Pengujian fitur verifikasi OTP email.
   */
  describe('verifyOtp', () => {
    /**
     * Menguji berhasil verifikasi OTP email.
     */
    it('berhasil verifikasi OTP email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: TEST_OTP,
        emailOtpExpires: OTP_EXPIRY(),
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.verifyOtp(TEST_EMAIL, TEST_OTP);
      expect(result).toHaveProperty('message');
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Menguji gagal verifikasi OTP jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyOtp('notfound@mail.com', '123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    /**
     * Menguji gagal verifikasi OTP jika sudah diverifikasi.
     */
    it('gagal jika sudah diverifikasi', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: true,
      });

      await expect(service.verifyOtp(TEST_EMAIL, '123')).rejects.toThrow(
        ConflictException,
      );
    });

    /**
     * Menguji gagal verifikasi OTP jika OTP tidak ada.
     */
    it('gagal jika OTP tidak ada', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: null,
        emailOtpExpires: null,
      });

      await expect(service.verifyOtp(TEST_EMAIL, '123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal verifikasi OTP jika OTP salah.
     */
    it('gagal jika OTP salah', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: '654321',
        emailOtpExpires: OTP_EXPIRY(),
      });

      await expect(service.verifyOtp(TEST_EMAIL, TEST_OTP)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal verifikasi OTP jika OTP kadaluarsa.
     */
    it('gagal jika OTP kadaluarsa', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: TEST_OTP,
        emailOtpExpires: OTP_EXPIRED(),
      });

      await expect(service.verifyOtp(TEST_EMAIL, TEST_OTP)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Pengujian fitur resend OTP email.
   */
  describe('resendOtp', () => {
    /**
     * Menguji berhasil mengirim ulang OTP jika user valid dan belum diverifikasi.
     */
    it('berhasil mengirim ulang OTP', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: null,
        emailOtpExpires: null,
        lastOtpSentAt: null,
      });
      prisma.user.update.mockResolvedValue({});
      jest.spyOn(service as any, 'generateOtp').mockReturnValue(TEST_OTP);
      jest
        .spyOn(service as any, 'generateOtpExpiry')
        .mockReturnValue(OTP_EXPIRY());
      jest.spyOn(service as any, 'sendOtpEmail').mockResolvedValue(undefined);

      const result = await service.resendOtp(TEST_EMAIL);
      expect(result).toHaveProperty('message');
      expect(prisma.user.update).toBeCalled();
    });

    /**
     * Menguji gagal resend OTP jika user tidak ditemukan.
     */
    it('gagal jika user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendOtp('notfound@mail.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal resend OTP jika sudah diverifikasi.
     */
    it('gagal jika sudah diverifikasi', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: true,
      });

      await expect(service.resendOtp(TEST_EMAIL)).rejects.toThrow(
        ConflictException,
      );
    });

    /**
     * Menguji gagal resend OTP jika OTP masih aktif.
     */
    it('gagal jika OTP masih aktif', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: TEST_OTP,
        emailOtpExpires: OTP_EXPIRY(),
      });

      await expect(service.resendOtp(TEST_EMAIL)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Menguji gagal resend OTP jika rate limit (kurang dari 1 menit).
     */
    it('gagal jika rate limit (kurang dari 1 menit)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        email: TEST_EMAIL,
        isEmailVerified: false,
        emailOtp: null,
        emailOtpExpires: null,
        lastOtpSentAt: new Date(Date.now() - 30 * 1000), // 30 detik yang lalu
      });

      await expect(service.resendOtp(TEST_EMAIL)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Pengujian generateJwt.
   */
  describe('generateJwt', () => {
    /**
     * Menguji generateJwt menghasilkan token JWT yang valid.
     */
    it('menghasilkan token JWT', () => {
      const user = { userId: 1, email: TEST_EMAIL, role: 'Intern' };
      const token = service.generateJwt(user);
      expect(token).toBe(TEST_JWT);
      expect(jwt.sign).toBeCalled();
    });
  });

  /**
   * Pengujian sendOtpEmail (mock nodemailer).
   */
  describe('sendOtpEmail', () => {
    /**
     * Menguji berhasil mengirim email OTP menggunakan nodemailer.
     */
    it('berhasil mengirim email OTP', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({});
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: sendMailMock,
      });

      await expect(
        service.sendOtpEmail(TEST_EMAIL, TEST_OTP),
      ).resolves.not.toThrow();
      expect(sendMailMock).toBeCalled();
    });

    /**
     * Menguji gagal mengirim email OTP jika terjadi error SMTP.
     */
    it('gagal mengirim email OTP', async () => {
      const sendMailMock = jest.fn().mockRejectedValue(new Error('SMTP error'));
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: sendMailMock,
      });

      await expect(service.sendOtpEmail(TEST_EMAIL, TEST_OTP)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  /**
   * Pengujian fitur validasi user Google (validateGoogleUser).
   */
  describe('validateGoogleUser', () => {
    /**
     * Menguji mengembalikan user jika sudah ada di database.
     */
    it('mengembalikan user jika sudah ada di database', async () => {
      const googleUser = {
        email: TEST_EMAIL,
        firstName: 'Test',
        lastName: 'User',
      };
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: TEST_EMAIL,
        role: TEST_ROLE,
      });

      const user = await service.validateGoogleUser(googleUser as any);
      expect(user).toHaveProperty('email', TEST_EMAIL);
      expect(prisma.user.findUnique).toBeCalled();
    });

    /**
     * Menguji membuat user baru jika belum ada di database.
     */
    it('membuat user baru jika belum ada di database', async () => {
      const googleUser = {
        email: 'new@mail.com',
        firstName: 'New',
        lastName: 'User',
      };
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.role.findUnique.mockResolvedValue(TEST_ROLE);
      prisma.user.create.mockResolvedValue({
        id: 2,
        name: 'New User',
        email: 'new@mail.com',
        role: TEST_ROLE,
      });

      const user = await service.validateGoogleUser(googleUser as any);
      expect(user).toHaveProperty('email', 'new@mail.com');
      expect(prisma.user.create).toBeCalled();
    });

    /**
     * Menguji gagal validasi Google user jika role default tidak ditemukan.
     */
    it('gagal jika role default tidak ditemukan', async () => {
      const googleUser = {
        email: 'fail@mail.com',
        firstName: 'Fail',
        lastName: 'User',
      };
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.validateGoogleUser(googleUser as any),
      ).rejects.toThrow();
    });
  });
});
