/**
 * Modul: app.controller.ts
 *
 * Modul ini mendefinisikan AppController yang bertanggung jawab
 * untuk menangani permintaan HTTP pada endpoint root aplikasi.
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller utama aplikasi.
 *
 * Bertanggung jawab untuk menangani permintaan HTTP ke endpoint root ('/').
 */
@Controller()
export class AppController {
  /**
   * Membuat instance AppController.
   *
   * @param appService - Instance dari AppService untuk mengambil data/pesan.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Mengembalikan pesan hello dari AppService.
   *
   * @returns {string} Pesan hello dalam bentuk string.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
