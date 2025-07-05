import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Req, // pastikan Req diimpor
} from '@nestjs/common'; // Tambahkan UseGuards, Get, Request
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Import AuthGuard

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

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    // Setelah user login di Google, Google akan mengarahkan kembali ke sini.
    // Passport akan memvalidasi dan `req.user` sudah berisi data dari GoogleStrategy.
    // Kita panggil service untuk menangani data user ini.
    return this.authService.googleLogin(req.user);
  }
}
