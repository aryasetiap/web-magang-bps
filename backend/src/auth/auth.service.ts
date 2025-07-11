import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: 'Intern' },
    });

    if (!defaultRole) {
      throw new InternalServerErrorException(
        "Role default 'Intern' tidak ditemukan.",
      );
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: defaultRole.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const user = await this.validateGoogleUser(req.user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          name: user.role.name,
        },
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, firstName, lastName } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'Intern' },
      });

      if (!defaultRole) {
        throw new InternalServerErrorException(
          "Role default 'Intern' tidak ditemukan.",
        );
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: hashedPassword,
          roleId: defaultRole.id,
        },
        include: { role: true },
      });
    }

    return user;
  }

  generateJwt(user: { userId: number; email: string; role: string }) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
