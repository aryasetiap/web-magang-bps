import { Test, TestingModule } from '@nestjs/testing';
import { FinalProjectsController } from './final-projects.controller';

describe('FinalProjectsController', () => {
  let controller: FinalProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinalProjectsController],
    }).compile();

    controller = module.get<FinalProjectsController>(FinalProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
