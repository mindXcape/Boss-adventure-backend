import { Module } from '@nestjs/common';
import { LodgesService } from './lodges.service';
import { LodgesController } from './lodges.controller';

@Module({
  controllers: [LodgesController],
  providers: [LodgesService]
})
export class LodgesModule {}
