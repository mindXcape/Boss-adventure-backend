import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private awsService: AwsService, private prisma: PrismaService) {}

  async uploadFile(req: any, res: FastifyReply<any>): Promise<any> {
    const data = await req['incomingFile'];

    data.filename = data.filename.replaceAll(' ', '-');
    await this.awsService.uploadFiletoS3(data.file, data.filename);

    res.send({ message: 'File uploaded successfully', statusCode: 200 });
  }
}
