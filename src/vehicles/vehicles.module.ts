import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, AwsService],
})
export class VehiclesModule {}
