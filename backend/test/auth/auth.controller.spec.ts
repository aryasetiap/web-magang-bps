/**
 * Unit Test untuk AuthController
 * ----------------------------------------------------------------
 * File ini berisi pengujian seluruh endpoint utama AuthController,
 * meliputi register, login, getProfile, updateProfile, changePassword,
 * forgotPassword, verifyResetPassword, Google OAuth, verifyOtp, dan resendOtp.
 * Setiap pengujian didokumentasikan dengan docstring berbahasa Indonesia
 * untuk memudahkan pemahaman dan maintenance.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../../src/auth/dto/register.dto';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { UpdateProfileDto } from '../../src/users/dto/update-profile.dto';
import { ChangePasswordDto } from '../../src/auth/dto/change-password.dto';
import { ForgotPasswordDto } from '../../src/auth/dto/forgot-password.dto';
import { VerifyResetPasswordDto } from '../../src/auth/dto/verify-reset-password.dto';

const TEST_EMAIL = 'test@mail.com';
const TEST_PASSWORD = 'password123';
const TEST_USER_ID = 1;
const TEST_USER_NAME = 'Test';
const TEST_ROLE = { name: 'Intern' };
const TEST_ACCESS_TOKEN = 'token';
const TEST_OTP = '123456';
const TEST_FRONTEND_URL = 'http://localhost:3001';

describe('AuthController', () => {
  /**
   * Deklarasi variabel controller dan mock service yang digunakan di seluruh test.
   */
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;

  /**
   * Setup sebelum setiap pengujian.
   * Membuat mock AuthService dan UsersService, lalu inisialisasi controller.
   */
  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      verifyResetPassword: jest.fn(),
      googleLogin: jest.fn(),
      verifyOtp: jest.fn(),
      resendOtp: jest.fn(),
    };
    usersService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  /**
   * Pengujian endpoint register.
   * Menguji proses registrasi user baru dan penanganan error pada service.
   */
  describe('register', () => {
    /**
     * Menguji skenario berhasil register user baru.
     */
    it('berhasil register user baru', async () => {
      /**
       * Tujuan: Memastikan user baru dapat diregistrasi dengan benar.
       */
      const dto: RegisterDto = {
        name: TEST_USER_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      };
      const expectedResponse = {
        message: 'ok',
        user: { email: dto.email },
      };
      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toBeCalledWith(dto);
    });

    /**
     * Menguji skenario gagal register jika terjadi error pada service.
     */
    it('gagal register jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat register.
       */
      const dto: RegisterDto = {
        name: TEST_USER_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      };
      authService.register.mockRejectedValue(new Error('error'));

      await expect(controller.register(dto)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint login.
   * Menguji proses login user dan penanganan error pada service.
   */
  describe('login', () => {
    /**
     * Menguji skenario berhasil login user.
     */
    it('berhasil login user', async () => {
      /**
       * Tujuan: Memastikan user dapat login dan mendapatkan token serta data user.
       */
      const dto: LoginDto = { email: TEST_EMAIL, password: TEST_PASSWORD };
      const expectedResponse = {
        access_token: TEST_ACCESS_TOKEN,
        user: {
          id: TEST_USER_ID,
          name: TEST_USER_NAME,
          email: TEST_EMAIL,
          role: TEST_ROLE,
        },
      };
      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toBeCalledWith(dto);
    });

    /**
     * Menguji skenario gagal login jika terjadi error pada service.
     */
    it('gagal login jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat login.
       */
      const dto: LoginDto = { email: TEST_EMAIL, password: TEST_PASSWORD };
      authService.login.mockRejectedValue(new Error('error'));

      await expect(controller.login(dto)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint getProfile.
   * Menguji pengambilan profil user dan validasi userId.
   */
  describe('getProfile', () => {
    /**
     * Menguji skenario berhasil mengambil profil user.
     */
    it('berhasil mengambil profil user', async () => {
      /**
       * Tujuan: Memastikan profil user dapat diambil dengan userId yang valid.
       */
      const req = { user: { userId: TEST_USER_ID } };
      const expectedProfile = { id: TEST_USER_ID, name: TEST_USER_NAME };
      usersService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(req as any);

      expect(result).toEqual(expectedProfile);
      expect(usersService.getProfile).toBeCalledWith(TEST_USER_ID);
    });

    /**
     * Menguji skenario gagal jika userId tidak ada pada request.
     */
    it('gagal jika userId tidak ada', async () => {
      /**
       * Tujuan: Memastikan error dilempar jika userId tidak tersedia pada request.
       */
      const req = { user: {} };
      await expect(controller.getProfile(req as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat getProfile.
       */
      const req = { user: { userId: TEST_USER_ID } };
      usersService.getProfile.mockRejectedValue(new Error('error'));

      await expect(controller.getProfile(req as any)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint updateProfile.
   * Menguji proses update profil user dan validasi userId.
   */
  describe('updateProfile', () => {
    /**
     * Menguji skenario berhasil update profil user.
     */
    it('berhasil update profil user', async () => {
      /**
       * Tujuan: Memastikan profil user dapat diperbarui dengan data yang valid.
       */
      const req = { user: { userId: TEST_USER_ID } };
      const dto: UpdateProfileDto = { name: TEST_USER_NAME } as any;
      const file = { path: 'file.jpg' };
      const expectedUser = { id: TEST_USER_ID, name: TEST_USER_NAME };
      usersService.updateProfile.mockResolvedValue(expectedUser);

      const result = await controller.updateProfile(
        req as any,
        dto,
        file as any,
      );

      expect(result).toEqual({
        message: 'Profil berhasil diperbarui',
        user: expectedUser,
      });
      expect(usersService.updateProfile).toBeCalledWith(
        TEST_USER_ID,
        dto,
        file,
      );
    });

    /**
     * Menguji skenario gagal jika userId tidak ada pada request.
     */
    it('gagal jika userId tidak ada', async () => {
      /**
       * Tujuan: Memastikan error dilempar jika userId tidak tersedia pada request saat updateProfile.
       */
      const req = { user: {} };
      await expect(
        controller.updateProfile(req as any, {} as any),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat updateProfile.
       */
      const req = { user: { userId: TEST_USER_ID } };
      usersService.updateProfile.mockRejectedValue(new Error('error'));

      await expect(
        controller.updateProfile(req as any, {} as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint changePassword.
   * Menguji proses ganti password dan validasi userId.
   */
  describe('changePassword', () => {
    /**
     * Menguji skenario berhasil ganti password.
     */
    it('berhasil ganti password', async () => {
      /**
       * Tujuan: Memastikan password user dapat diganti dengan benar.
       */
      const req = { user: { userId: TEST_USER_ID } };
      const dto: ChangePasswordDto = {
        oldPassword: 'old',
        newPassword: 'newpass123',
      };
      const expectedResponse = { message: 'Password berhasil diubah' };
      authService.changePassword.mockResolvedValue(expectedResponse);

      const result = await controller.changePassword(req as any, dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.changePassword).toBeCalledWith(
        TEST_USER_ID,
        dto.oldPassword,
        dto.newPassword,
      );
    });

    /**
     * Menguji skenario gagal jika userId tidak ada pada request.
     */
    it('gagal jika userId tidak ada', async () => {
      /**
       * Tujuan: Memastikan error dilempar jika userId tidak tersedia pada request saat changePassword.
       */
      const req = { user: {} };
      await expect(
        controller.changePassword(req as any, {} as any),
      ).rejects.toThrow(BadRequestException);
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat changePassword.
       */
      const req = { user: { userId: TEST_USER_ID } };
      authService.changePassword.mockRejectedValue(new Error('error'));

      await expect(
        controller.changePassword(req as any, {} as any),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint forgotPassword.
   * Menguji proses pengiriman email lupa password dan penanganan error.
   */
  describe('forgotPassword', () => {
    /**
     * Menguji skenario berhasil mengirim email lupa password.
     */
    it('berhasil mengirim email lupa password', async () => {
      /**
       * Tujuan: Memastikan email OTP reset password dapat dikirimkan ke user.
       */
      const dto: ForgotPasswordDto = { email: TEST_EMAIL };
      const expectedResponse = {
        message: 'OTP reset password telah dikirim ke email Anda.',
      };
      authService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.forgotPassword).toBeCalledWith(dto.email);
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat forgotPassword.
       */
      const dto: ForgotPasswordDto = { email: TEST_EMAIL };
      authService.forgotPassword.mockRejectedValue(new Error('error'));

      await expect(controller.forgotPassword(dto)).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint verifyResetPassword.
   * Menguji proses verifikasi reset password dan penanganan error.
   */
  describe('verifyResetPassword', () => {
    /**
     * Menguji skenario berhasil verifikasi reset password.
     */
    it('berhasil verifikasi reset password', async () => {
      /**
       * Tujuan: Memastikan password user dapat direset dengan OTP yang valid.
       */
      const dto: VerifyResetPasswordDto = {
        email: TEST_EMAIL,
        otp: TEST_OTP,
        newPassword: 'newpass123',
      };
      const expectedResponse = {
        message:
          'Password berhasil direset. Silakan login dengan password baru.',
      };
      authService.verifyResetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.verifyResetPassword(dto);

      expect(result).toEqual(expectedResponse);
      expect(authService.verifyResetPassword).toBeCalledWith(
        dto.email,
        dto.otp,
        dto.newPassword,
      );
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat verifyResetPassword.
       */
      const dto: VerifyResetPasswordDto = {
        email: TEST_EMAIL,
        otp: TEST_OTP,
        newPassword: 'newpass123',
      };
      authService.verifyResetPassword.mockRejectedValue(new Error('error'));

      await expect(controller.verifyResetPassword(dto)).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint verifyOtp.
   * Menguji proses verifikasi OTP email dan penanganan error.
   */
  describe('verifyOtp', () => {
    /**
     * Menguji skenario berhasil verifikasi OTP.
     */
    it('berhasil verifikasi OTP', async () => {
      /**
       * Tujuan: Memastikan OTP email dapat diverifikasi dengan benar.
       */
      const expectedResponse = { message: 'Email berhasil diverifikasi' };
      authService.verifyOtp.mockResolvedValue(expectedResponse);

      const body = { email: TEST_EMAIL, otp: TEST_OTP };
      const result = await controller.verifyOtp(body);

      expect(result).toEqual(expectedResponse);
      expect(authService.verifyOtp).toBeCalledWith(body.email, body.otp);
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat verifyOtp.
       */
      authService.verifyOtp.mockRejectedValue(new Error('error'));

      await expect(
        controller.verifyOtp({ email: TEST_EMAIL, otp: TEST_OTP }),
      ).rejects.toThrow('error');
    });
  });

  /**
   * Pengujian endpoint resendOtp.
   * Menguji proses pengiriman ulang OTP email dan penanganan error.
   */
  describe('resendOtp', () => {
    /**
     * Menguji skenario berhasil mengirim ulang OTP.
     */
    it('berhasil mengirim ulang OTP', async () => {
      /**
       * Tujuan: Memastikan OTP baru dapat dikirim ulang ke email user.
       */
      const expectedResponse = {
        message: 'OTP baru telah dikirim ke email Anda.',
      };
      authService.resendOtp.mockResolvedValue(expectedResponse);

      const body = { email: TEST_EMAIL };
      const result = await controller.resendOtp(body);

      expect(result).toEqual(expectedResponse);
      expect(authService.resendOtp).toBeCalledWith(body.email);
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika service error', async () => {
      /**
       * Tujuan: Memastikan error pada service ditangani dengan benar saat resendOtp.
       */
      authService.resendOtp.mockRejectedValue(new Error('error'));

      await expect(controller.resendOtp({ email: TEST_EMAIL })).rejects.toThrow(
        'error',
      );
    });
  });

  /**
   * Pengujian endpoint googleCallback.
   * Menguji proses callback Google OAuth, baik happy path maupun error path.
   */
  describe('googleCallback', () => {
    /**
     * Menguji skenario berhasil redirect ke frontend dengan token dan user.
     */
    it('berhasil redirect ke frontend dengan token dan user', async () => {
      /**
       * Tujuan: Memastikan callback Google OAuth berhasil dan redirect ke frontend dengan token.
       */
      const req = {
        user: { email: TEST_EMAIL, name: 'Test User' },
      };
      const res = { redirect: jest.fn() };
      authService.googleLogin.mockResolvedValue({
        user: {
          id: TEST_USER_ID,
          name: 'Test User',
          email: TEST_EMAIL,
          role: TEST_ROLE,
        },
        access_token: TEST_ACCESS_TOKEN,
      });

      process.env.FRONTEND_URL = TEST_FRONTEND_URL;

      await controller.googleCallback(req as any, res as any);

      expect(authService.googleLogin).toBeCalledWith({
        email: TEST_EMAIL,
        firstName: 'Test',
        lastName: 'User',
      });
      expect(res.redirect).toBeCalledWith(
        expect.stringContaining(
          `${TEST_FRONTEND_URL}/auth/callback?token=${TEST_ACCESS_TOKEN}`,
        ),
      );
    });

    /**
     * Menguji skenario gagal jika data user Google tidak valid.
     */
    it('gagal jika data user Google tidak valid', async () => {
      /**
       * Tujuan: Memastikan error redirect jika data user Google tidak valid.
       */
      const req = { user: {} };
      const res = { redirect: jest.fn() };

      process.env.FRONTEND_URL = TEST_FRONTEND_URL;

      await controller.googleCallback(req as any, res as any);

      expect(res.redirect).toBeCalledWith(
        expect.stringContaining(
          `${TEST_FRONTEND_URL}/auth/callback?error=Data%20user%20Google%20tidak%20valid`,
        ),
      );
    });

    /**
     * Menguji skenario gagal jika terjadi error pada service.
     */
    it('gagal jika terjadi error pada service', async () => {
      /**
       * Tujuan: Memastikan error pada service Google OAuth ditangani dengan redirect error.
       */
      const req = { user: { email: TEST_EMAIL, name: 'Test User' } };
      const res = { redirect: jest.fn() };
      authService.googleLogin.mockRejectedValue(new Error('error'));

      process.env.FRONTEND_URL = TEST_FRONTEND_URL;

      await controller.googleCallback(req as any, res as any);

      expect(res.redirect).toBeCalledWith(
        expect.stringContaining(
          `${TEST_FRONTEND_URL}/auth/callback?error=error`,
        ),
      );
    });

    /**
     * Menguji skenario gagal jika terjadi error unknown pada googleCallback.
     */
    it('gagal jika terjadi error unknown pada googleCallback', async () => {
      const req = { user: { email: TEST_EMAIL, name: 'Test User' } };
      const res = { redirect: jest.fn() };
      // Paksa error unknown (bukan object)
      controller['authService'].googleLogin = jest
        .fn()
        .mockImplementation(() => {
          throw 'SOME_STRING_ERROR';
        });

      process.env.FRONTEND_URL = TEST_FRONTEND_URL;

      await controller.googleCallback(req as any, res as any);

      expect(res.redirect).toBeCalledWith(
        expect.stringContaining(
          `${TEST_FRONTEND_URL}/auth/callback?error=Unknown%20error`,
        ),
      );
    });
  });

  /**
   * Pengujian endpoint googleAuth (GET /auth/google).
   * Hanya memastikan tidak error (karena hanya trigger guard).
   */
  describe('googleAuth', () => {
    /**
     * Menguji bahwa endpoint googleAuth tidak error saat dipanggil.
     */
    it('tidak error saat dipanggil (hanya trigger guard)', async () => {
      /**
       * Tujuan: Memastikan endpoint googleAuth dapat dipanggil tanpa error.
       */
      await expect(controller.googleAuth()).resolves.toBeUndefined();
    });
  });
});
