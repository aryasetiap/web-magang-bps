import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth') // Semua endpoint di sini akan diawali dengan /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Ini akan membuat endpoint POST /auth/register
  register(@Body() registerUserDto: RegisterUserDto) {
    // @Body() akan mengambil body dari request dan NestJS akan otomatis
    // memvalidasinya menggunakan RegisterUserDto
    return this.authService.register(registerUserDto);
  }
}
