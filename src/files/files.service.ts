import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomImageName } from 'src/utils/imageName';

@Injectable()
export class FilesService {
  constructor(private awsService: AwsService, private prisma: PrismaService) {}

  async uploadFile(req: any, res: FastifyReply<any>): Promise<any> {
    const data = await req['incomingFile'];
    const fileName = randomImageName();
    data.filename = fileName;

    await this.awsService.uploadFiletoS3(data.file, data.filename);

    const signedUrl = await this.awsService.getSignedUrlFromS3(fileName);

    res.send({ data: { signedUrl, fileName }, statusCode: 200 });
  }

  // upload file to particular directory
  async uploadFileToFolder(req: any, folder: string, res: FastifyReply<any>): Promise<any> {
    const data = await req['incomingFile'];
    const fileName = `${folder}/${data.filename ?? randomImageName()}`;
    data.filename = fileName;

    await this.awsService.uploadFiletoS3(data.file, fileName);

    const signedUrl = await this.awsService.getSignedUrlFromS3(fileName);

    res.send({ data: { signedUrl, fileName }, statusCode: 200 });
  }
}
