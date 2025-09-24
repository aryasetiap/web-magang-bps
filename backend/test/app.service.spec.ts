/**
 * @file app.service.spec.ts
 * @description
 * Berisi unit test untuk AppService.
 * Setiap bagian pengujian didokumentasikan dengan docstring berbahasa Indonesia.
 * Tujuan utama file ini adalah memastikan seluruh fitur utama AppService berjalan sesuai harapan.
 */

import { AppService } from '../src/app.service';

// Konstanta untuk expected value agar mudah diubah dan menghindari magic string.
const EXPECTED_HELLO_MESSAGE = 'Hello World!';

describe('AppService', () => {
  /**
   * @description
   * Variabel untuk menyimpan instance AppService yang akan diuji.
   */
  let service: AppService;

  /**
   * @description
   * Melakukan inisialisasi instance AppService sebelum setiap pengujian.
   * Hal ini memastikan setiap test case mendapatkan instance yang bersih.
   */
  beforeEach(() => {
    service = new AppService();
  });

  /**
   * @description
   * Pengujian untuk method getHello pada AppService.
   * Tujuan: Memastikan method ini mengembalikan pesan sambutan yang sesuai.
   */
  describe('getHello', () => {
    /**
     * @description
     * Test case untuk memastikan method getHello mengembalikan pesan yang benar.
     * Diuji dengan membandingkan hasil return dengan nilai yang diharapkan.
     */
    it('seharusnya mengembalikan pesan sambutan yang benar', () => {
      const result = service.getHello();
      expect(result).toBe(EXPECTED_HELLO_MESSAGE);
    });
  });
});
