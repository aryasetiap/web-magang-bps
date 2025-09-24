/**
 * roles.guard.ts
 *
 * Guard untuk memeriksa apakah user memiliki role yang dibutuhkan
 * berdasarkan metadata 'roles' pada handler atau class.
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard
 *
 * Guard yang digunakan untuk memvalidasi apakah user memiliki role yang sesuai
 * dengan metadata 'roles' yang didefinisikan pada handler atau class.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Membuat instance RolesGuard.
   * @param reflector Digunakan untuk mengambil metadata roles dari handler/class.
   */
  constructor(private readonly reflector: Reflector) {}

  /**
   * Mengecek apakah user memiliki salah satu role yang dibutuhkan.
   * @param context ExecutionContext dari request yang masuk.
   * @returns boolean True jika user memiliki role yang sesuai, false jika tidak.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { role?: { name?: string } | string | string[] };
    }>();
    const user = request.user;

    const userRole = this.extractUserRole(user);

    if (!userRole) return false;

    return requiredRoles.some(
      (role) => userRole.toLowerCase() === role.toLowerCase(),
    );
  }

  /**
   * Mengambil role user dalam bentuk string dari objek user.
   * @param user Objek user yang didapat dari request.
   * @returns string | undefined Role user dalam bentuk string, atau undefined jika tidak ada.
   */
  private extractUserRole(user?: {
    role?: { name?: string } | string | string[];
  }): string | undefined {
    if (!user || !user.role) return undefined;

    if (typeof user.role === 'string') {
      return user.role;
    }

    if (Array.isArray(user.role) && typeof user.role[0] === 'string') {
      return user.role[0];
    }

    if (typeof user.role === 'object' && 'name' in user.role) {
      return user.role.name;
    }

    return undefined;
  }
}
