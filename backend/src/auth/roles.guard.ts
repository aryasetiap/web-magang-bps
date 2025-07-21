import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard untuk memeriksa apakah user memiliki role yang dibutuhkan
 * berdasarkan metadata 'roles' pada handler atau class.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  /**
   * Mengecek apakah user memiliki salah satu role yang dibutuhkan.
   * @param context ExecutionContext dari request yang masuk
   * @returns boolean true jika user memiliki role yang sesuai, false jika tidak
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    let userRole = user.role?.name || user.role;
    if (Array.isArray(userRole)) {
      userRole = userRole[0];
    }
    if (!userRole) return false;

    const hasRole = requiredRoles.some(
      (role) => userRole?.toLowerCase() === role.toLowerCase(),
    );
    return hasRole;
  }
}
