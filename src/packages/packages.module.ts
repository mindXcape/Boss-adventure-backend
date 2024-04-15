import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService, AwsService],
})
export class PackagesModule {}
