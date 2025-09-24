/**
 * Unit Test untuk AppController
 * -------------------------------------------------
 * File ini berisi pengujian seluruh endpoint utama AppController.
 * Setiap bagian pengujian didokumentasikan dengan docstring berbahasa Indonesia.
 * Tujuan: Memastikan setiap endpoint pada AppController berfungsi sesuai harapan.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

// Konstanta pesan yang digunakan pada pengujian
const HELLO_MESSAGE = 'Hello World!';
const SERVICE_ERROR_MESSAGE = 'Service error';

describe('AppController', () => {
  /**
   * Deklarasi variabel controller dan service mock.
   * controller: Instance dari AppController yang akan diuji.
   * service: Mock dari AppService untuk mengontrol perilaku dependensi.
   */
  let controller: AppController;
  let service: Record<string, jest.Mock>;

  /**
   * Setup sebelum setiap pengujian.
   * Membuat mock service dan instance controller menggunakan dependency injection.
   */
  beforeEach(async () => {
    service = {
      getHello: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: service }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  /**
   * Pengujian endpoint GET /
   * -------------------------------------------------
   * Menguji method getHello pada AppController.
   * Tujuan: Memastikan response sesuai dengan yang diberikan oleh service.
   */
  describe('getHello', () => {
    /**
     * Pengujian sukses.
     * Tujuan: Memastikan controller mengembalikan pesan dari service dengan benar.
     */
    it('seharusnya mengembalikan pesan hello dari service', () => {
      service.getHello.mockReturnValue(HELLO_MESSAGE);

      const result = controller.getHello();

      expect(result).toBe(HELLO_MESSAGE);
      expect(service.getHello).toBeCalled();
    });

    /**
     * Pengujian error.
     * Tujuan: Memastikan controller melempar error jika service mengalami error.
     */
    it('seharusnya melempar error jika service error', () => {
      service.getHello.mockImplementation(() => {
        throw new Error(SERVICE_ERROR_MESSAGE);
      });

      expect(() => controller.getHello()).toThrow(SERVICE_ERROR_MESSAGE);
    });
  });
});
