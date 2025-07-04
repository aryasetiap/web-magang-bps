import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy'; // 1. Impor GoogleStrategy

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'INI_RAHASIA_SEKALI_JANGAN_DITIRU',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy], // 2. Tambahkan GoogleStrategy di sini
})
export class AuthModule {}
