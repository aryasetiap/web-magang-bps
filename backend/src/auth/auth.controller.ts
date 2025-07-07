import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Req,
  Res,
  Patch, // Tambahkan Patch
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

// Tambahkan import berikut
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  // Tambahkan UsersService ke constructor
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // Endpoint ini sekarang dilindungi oleh "penjaga" JWT
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    // req.user diisi otomatis oleh Passport dari JwtStrategy
    return req.user;
  }

  // Tambahkan endpoint PATCH untuk update profile
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.userId;
    return this.usersService.update(userId, updateProfileDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Method ini tidak akan pernah dieksekusi.
    // Guard 'google' akan otomatis me-redirect ke halaman login Google.
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // req.user diisi oleh GoogleStrategy.validate
    const user = req.user;
    // Generate JWT
    const jwtToken = this.authService.generateJwt(user);

    // Redirect ke FE dengan query token dan role
    return res.redirect(
      `http://localhost:5173/login?token=${jwtToken}&role=${user.role}`,
    );
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    // req.user diisi oleh GoogleStrategy.validate
    // Lakukan login/daftar user di sini, lalu redirect ke FE
    const jwtToken = this.authService.generateJwt(req.user);
    return res.redirect(
      `http://localhost:5173/login?token=${jwtToken}&role=${req.user.role}`,
    );
  }
}
