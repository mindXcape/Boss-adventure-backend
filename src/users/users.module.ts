import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AwsService } from 'src/aws/aws.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AwsService],
})
export class UsersModule {}
