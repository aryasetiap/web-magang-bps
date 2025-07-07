import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { UsersModule } from '../users/users.module'; // <-- Impor UsersModule

@Module({
  imports: [
    UsersModule, // <-- Tambahkan UsersModule di sini
    PassportModule,
    JwtModule.register({
      secret: 'INI_RAHASIA_SEKALI_JANGAN_DITIRU',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
