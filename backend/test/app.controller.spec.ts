import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Pengujian untuk AppController.
 * Menguji fungsionalitas dasar dari AppController.
 */
describe('AppController', () => {
  let appController: AppController;

  /**
   * Inisialisasi modul pengujian dan instance AppController sebelum setiap pengujian.
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * Pengujian endpoint root.
   * Memastikan bahwa fungsi getHello() mengembalikan string yang diharapkan.
   */
  describe('root', () => {
    it('seharusnya mengembalikan "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
