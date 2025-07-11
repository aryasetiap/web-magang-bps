import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsService } from './final-projects.service';

describe('FinalProjectsService', () => {
  let service: FinalProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinalProjectsService],
    }).compile();

    service = module.get<FinalProjectsService>(FinalProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
