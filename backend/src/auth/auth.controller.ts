/**
 * Modul AuthController
 * -----------------------------------------
 * Mengelola autentikasi, otorisasi, dan manajemen profil user.
 * Termasuk registrasi, login, update profil, ganti password,
 * lupa password, verifikasi OTP, serta autentikasi Google OAuth.
 */

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Req,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetPasswordDto } from './dto/verify-reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Interface JwtRequest
 * -----------------------------------------
 * Mendefinisikan struktur request yang membawa data user hasil autentikasi JWT.
 */
interface JwtRequest extends Request {
  user?: {
    userId: number;
    name?: string;
    email?: string;
    role?: { name: string };
  };
}

/**
 * Controller untuk endpoint terkait autentikasi dan manajemen user.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Konstruktor AuthController
   * @param authService Service untuk logika autentikasi.
   * @param usersService Service untuk manajemen data user.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Registrasi user baru.
   * @param registerDto Data registrasi user.
   * @returns Hasil registrasi user.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user.
   * @param loginDto Data login user.
   * @returns Token akses dan data user.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    const { access_token, user } = await this.authService.login(loginDto);
    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: { name: user.role.name },
      },
    };
  }

  /**
   * Mendapatkan profil user yang sedang login.
   * @param req Request yang berisi userId.
   * @returns Data profil user.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Get profile user yang sedang login' })
  @ApiBearerAuth()
  async getProfile(@Request() req: JwtRequest) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    return this.usersService.getProfile(userId);
  }

  /**
   * Mengupdate profil user, termasuk upload foto profil.
   * @param req Request yang berisi userId.
   * @param updateProfileDto Data profil yang akan diupdate.
   * @param profilePhoto File foto profil (opsional).
   * @returns Pesan dan data user yang telah diperbarui.
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @ApiOperation({ summary: 'Update profil user dengan upload foto profil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update profile data dengan foto profil (optional)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        namaLengkap: { type: 'string' },
        nimNisn: { type: 'string' },
        asalInstitusi: { type: 'string' },
        jurusanProdi: { type: 'string' },
        nomorTelepon: { type: 'string' },
        alamat: { type: 'string' },
        profilePhoto: {
          type: 'string',
          format: 'binary',
          description: 'File foto profil (JPG, JPEG, PNG, GIF, max 2MB)',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: diskStorage({
        destination: './uploads/profile-photos',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(
            new BadRequestException(
              'Hanya file gambar yang diperbolehkan (JPG, JPEG, PNG, GIF)',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diupdate',
  })
  @ApiResponse({
    status: 400,
    description: 'File tidak valid atau terlalu besar',
  })
  async updateProfile(
    @Request() req: JwtRequest,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profilePhoto?: Express.Multer.File,
  ) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
      profilePhoto,
    );
    return {
      message: 'Profil berhasil diperbarui',
      user: updatedUser,
    };
  }

  /**
   * Mengganti password user yang sedang login.
   * @param req Request yang berisi userId.
   * @param dto Data perubahan password.
   * @returns Hasil perubahan password.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiOperation({ summary: 'Ganti password user' })
  async changePassword(
    @Request() req: JwtRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user?.userId;
    if (typeof userId !== 'number') {
      throw new BadRequestException('User ID tidak ditemukan');
    }
    return this.authService.changePassword(
      userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  /**
   * Mengirim email lupa password.
   * @param dto Data email user.
   * @returns Hasil pengiriman email lupa password.
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Kirim email lupa password' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * Verifikasi reset password dengan OTP.
   * @param dto Data verifikasi reset password.
   * @returns Hasil verifikasi reset password.
   */
  @Post('verify-reset-password')
  @ApiOperation({ summary: 'Verifikasi reset password dengan OTP' })
  async verifyResetPassword(@Body() dto: VerifyResetPasswordDto) {
    return this.authService.verifyResetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
  }

  /**
   * Inisiasi autentikasi Google OAuth.
   * @returns Tidak mengembalikan nilai, proses dialihkan ke Google.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Inisiasi autentikasi Google OAuth' })
  async googleAuth() {}

  /**
   * Callback autentikasi Google OAuth.
   * Redirect ke frontend dengan token dan data user.
   * @param req Request hasil autentikasi Google.
   * @param res Response untuk redirect.
   * @returns Tidak mengembalikan nilai, hanya redirect.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback autentikasi Google OAuth' })
  async googleCallback(@Req() req: JwtRequest, @Res() res: Response) {
    try {
      if (
        !req.user ||
        typeof req.user.email !== 'string' ||
        typeof req.user.name !== 'string'
      ) {
        throw new BadRequestException('Data user Google tidak valid');
      }
      // Pisahkan nama depan dan belakang jika memungkinkan
      const [firstName, ...rest] = req.user.name.split(' ');
      const lastName = rest.join(' ') || '';
      const googleUser = {
        email: req.user.email,
        firstName,
        lastName,
      };
      const { user, access_token } =
        await this.authService.googleLogin(googleUser);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      res.redirect(
        `${frontendUrl}/auth/callback?token=${access_token}&user=${encodedUser}`,
      );
    } catch (error: unknown) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      let errorMsg = 'Unknown error';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = String((error as { message?: string }).message) || errorMsg;
      }
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMsg)}`,
      );
    }
  }

  /**
   * Verifikasi OTP untuk aktivasi user.
   * @param body Data email dan OTP.
   * @returns Data user yang telah diverifikasi.
   */
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verifikasi OTP aktivasi user' })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  /**
   * Mengirim ulang OTP ke email user.
   * @param body Data email user.
   * @returns Hasil pengiriman ulang OTP.
   */
  @Post('resend-otp')
  @ApiOperation({ summary: 'Kirim ulang OTP ke email user' })
  async resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }
}
