import { Test, TestingModule } from '@nestjs/testing';
import { LodgesController } from './lodges.controller';
import { LodgesService } from './lodges.service';

describe('LodgesController', () => {
  let controller: LodgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LodgesController],
      providers: [LodgesService],
    }).compile();

    controller = module.get<LodgesController>(LodgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
