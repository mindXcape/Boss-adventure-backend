import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [HotelsController],
  providers: [HotelsService, AwsService],
})
export class HotelsModule {}
