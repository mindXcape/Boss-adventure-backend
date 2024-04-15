import { Module } from '@nestjs/common';
import { FranchisesService } from './franchises.service';
import { FranchisesController } from './franchises.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [FranchisesController],
  providers: [FranchisesService, AwsService],
})
export class FranchisesModule {}
