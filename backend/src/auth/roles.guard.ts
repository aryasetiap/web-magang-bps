// src/auth/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // Ambil role dari user.role atau user.role.name
    let userRole = user.role?.name || user.role;
    if (Array.isArray(userRole)) {
      userRole = userRole[0]; // ambil role pertama jika array
    }
    if (!userRole) return false;
    // Bandingkan lowercase
    return requiredRoles
      .map((r) => r.toLowerCase())
      .includes(userRole.toLowerCase());
  }
}
