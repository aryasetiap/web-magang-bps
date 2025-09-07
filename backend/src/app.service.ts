/**
 * Modul AppService
 * ----------------
 * Modul ini mendefinisikan layanan utama aplikasi yang menyediakan
 * fungsi dasar seperti mengembalikan pesan sambutan.
 */

import { Injectable } from '@nestjs/common';

/**
 * Kelas AppService
 * ----------------
 * Layanan utama aplikasi yang menyediakan fungsi dasar.
 */
@Injectable()
export class AppService {
  /**
   * Mengembalikan pesan sambutan.
   *
   * @returns {string} Pesan sambutan "Hello World!".
   */
  getHello(): string {
    return 'Hello World!';
  }
}
