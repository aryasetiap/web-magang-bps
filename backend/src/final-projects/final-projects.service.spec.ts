import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsService } from './final-projects.service';

/**
 * Pengujian unit untuk FinalProjectsService.
 *
 * Suite ini memastikan bahwa service FinalProjectsService dapat diinisialisasi dengan benar.
 */
describe('FinalProjectsService', () => {
  let service: FinalProjectsService;

  /**
   * Inisialisasi modul pengujian dan instance FinalProjectsService sebelum setiap pengujian dijalankan.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinalProjectsService],
    }).compile();

    service = module.get<FinalProjectsService>(FinalProjectsService);
  });

  /**
   * Menguji apakah instance FinalProjectsService berhasil didefinisikan.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
