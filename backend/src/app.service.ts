import { Injectable } from '@nestjs/common';

/**
 * Layanan utama aplikasi.
 * 
 * Kelas ini menyediakan fungsi dasar untuk aplikasi,
 * seperti mengembalikan pesan sambutan.
 */
@Injectable()
export class AppService {
  /**
   * Mengembalikan pesan sambutan "Hello World!".
   * @returns Pesan sambutan dalam bentuk string.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
