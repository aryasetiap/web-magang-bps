// src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Mendapatkan peran apa saja yang dibutuhkan untuk mengakses endpoint ini.
    //    Kita akan definisikan 'roles' ini nanti menggunakan decorator kustom.
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      // Jika sebuah endpoint tidak mendefinisikan peran apa pun, kita anggap publik.
      return true;
    }

    // 2. Mendapatkan objek 'user' dari request.
    //    Ingat, objek ini sudah divalidasi dan ditempelkan oleh JwtAuthGuard sebelumnya.
    const { user } = context.switchToHttp().getRequest();

    // 3. Membandingkan peran user dengan peran yang dibutuhkan.
    //    Mengecek apakah peran yang dimiliki user (`user.role`) ada di dalam
    //    daftar peran yang diizinkan (`requiredRoles`).
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
