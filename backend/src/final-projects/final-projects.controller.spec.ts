import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsController } from './final-projects.controller';

/**
 * Pengujian unit untuk FinalProjectsController.
 *
 * Suite ini memastikan bahwa controller dapat diinisialisasi dengan benar.
 */
describe('FinalProjectsController', () => {
  let controller: FinalProjectsController;

  /**
   * Menyiapkan modul pengujian dan menginisialisasi controller sebelum setiap pengujian dijalankan.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinalProjectsController],
    }).compile();

    controller = module.get<FinalProjectsController>(FinalProjectsController);
  });

  /**
   * Memastikan bahwa controller telah terdefinisi setelah inisialisasi.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
