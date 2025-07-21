import { SetMetadata } from '@nestjs/common';

/**
 * Dekorator custom untuk menetapkan metadata peran (roles) pada route handler.
 * Digunakan untuk membatasi akses berdasarkan peran pengguna.
 * 
 * @param roles Daftar peran yang diizinkan mengakses route
 * @returns Fungsi dekorator
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
