import { Test, TestingModule } from '@nestjs/testing';
import { LodgesService } from './lodges.service';

describe('LodgesService', () => {
  let service: LodgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LodgesService],
    }).compile();

    service = module.get<LodgesService>(LodgesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
