/**
 * Modul DTO untuk permintaan lupa kata sandi.
 *
 * Modul ini mendefinisikan struktur data yang digunakan untuk menerima permintaan
 * lupa kata sandi, yaitu berupa alamat email yang valid.
 */

import { IsEmail } from 'class-validator';

/**
 * Data Transfer Object (DTO) untuk permintaan lupa kata sandi.
 *
 * Kelas ini digunakan untuk memvalidasi data permintaan lupa kata sandi,
 * memastikan bahwa email yang diberikan memiliki format yang valid.
 *
 * @property {string} email - Alamat email pengguna yang meminta reset kata sandi.
 */
export class ForgotPasswordDto {
  /**
   * Alamat email pengguna yang meminta reset kata sandi.
   *
   * @type {string}
   */
  @IsEmail()
  email: string;
}
