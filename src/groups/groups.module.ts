import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, AwsService],
})
export class GroupsModule {}
