import { Module } from '@nestjs/common';
import { PmsService } from './pms.service';
import { PmsController } from './pms.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [PmsController],
  providers: [PmsService, AwsService],
})
export class PmsModule {}
