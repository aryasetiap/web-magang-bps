import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller utama aplikasi.
 * Bertanggung jawab untuk menangani permintaan HTTP ke endpoint root.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Mengembalikan pesan hello dari AppService.
   * @returns Pesan hello dalam bentuk string.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
