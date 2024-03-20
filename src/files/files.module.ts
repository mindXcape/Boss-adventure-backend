import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [AwsModule],
})
export class FilesModule {}
