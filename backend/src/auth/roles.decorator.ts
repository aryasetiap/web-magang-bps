import { SetMetadata } from '@nestjs/common';

/**
 * Dekorator custom untuk menetapkan metadata peran (roles) pada route handler.
 * Digunakan untuk membatasi akses berdasarkan peran pengguna.
 *
 * @param roles Daftar peran yang diizinkan mengakses route
 * @returns Fungsi dekorator
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
/**
 * Modul ini menyediakan dekorator custom untuk menetapkan metadata peran (roles)
 * pada route handler di aplikasi NestJS. Dekorator ini digunakan untuk membatasi
 * akses endpoint berdasarkan peran pengguna yang telah ditentukan.
 *
 * @module RolesDecorator
 */

export default Roles;
