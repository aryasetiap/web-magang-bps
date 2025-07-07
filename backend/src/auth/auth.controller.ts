import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Req, // pastikan Req diimpor
  Res, // Tambahkan Res diimpor
} from '@nestjs/common'; // Tambahkan UseGuards, Get, Request
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Import AuthGuard
import { Response } from 'express'; // Tambahkan import ini

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
