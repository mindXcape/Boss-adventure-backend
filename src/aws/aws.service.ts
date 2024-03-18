import { Injectable } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';
import * as stream from 'stream';

@Injectable()
export class AwsService {
  async uploadFiletoS3(data: any, filename: string) {
    const streams = new stream.PassThrough();
    try {
      const uploadToS3 = new Upload({
        client: new S3({
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          },
          region: 'ap-south-1',
        }),
        tags: [],
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: filename,
          Body: streams,
        },
      });

      data.pipe(streams);
      await uploadToS3.done();
    } catch (e) {
      console.log(e);
    }
  }
}
