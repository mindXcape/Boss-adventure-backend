import { Module } from '@nestjs/common';
import { LodgesService } from './lodges.service';
import { LodgesController } from './lodges.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [LodgesController],
  providers: [LodgesService, AwsService],
})
export class LodgesModule {}
