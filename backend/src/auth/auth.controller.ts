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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  /**
   * Endpoint untuk registrasi user baru.
   * @param registerDto Data registrasi user.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint untuk login user.
   * @param loginDto Data login user.
   */
  @Post('login')
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
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Get profile user yang sedang login' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getProfile(userId);
  }

  /**
   * Mengupdate profil user, termasuk upload foto profil.
   * @param req Request yang berisi userId.
   * @param updateProfileDto Data profil yang akan diupdate.
   * @param profilePhoto File foto profil (opsional).
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
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
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
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profilePhoto?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
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
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.userId;
    return this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }

  /**
   * Mengirim email lupa password.
   * @param dto Data email user.
   */
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * Verifikasi reset password dengan OTP.
   * @param dto Data verifikasi reset password.
   */
  @Post('verify-reset-password')
  async verifyResetPassword(@Body() dto: VerifyResetPasswordDto) {
    return this.authService.verifyResetPassword(dto.email, dto.otp, dto.newPassword);
  }

  /**
   * Inisiasi autentikasi Google OAuth.
   * @param req Request.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  /**
   * Callback autentikasi Google OAuth.
   * Redirect ke frontend dengan token dan data user.
   * @param req Request.
   * @param res Response.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    try {
      const { user, access_token } = await this.authService.googleLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      res.redirect(
        `${frontendUrl}/auth/callback?token=${access_token}&user=${encodedUser}`,
      );
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  /**
   * Verifikasi OTP untuk aktivasi user.
   * @param body Data email dan OTP.
   */
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const user = await this.authService.verifyOtp(body.email, body.otp);
    return user;
  }

  /**
   * Mengirim ulang OTP ke email user.
   * @param body Data email user.
   */
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body.email);
  }
}
