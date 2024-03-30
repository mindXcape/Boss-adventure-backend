import { Injectable, Logger } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as stream from 'stream';

@Injectable()
export class AwsService {
  private readonly _logger = new Logger('Aws Services');
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

      this._logger.log(`Uploading file to S3: ${filename}`);
      data.pipe(streams);
      await uploadToS3.done();
    } catch (e) {
      console.log(e);
    }
  }

  async getSignedUrlFromS3(filename: string) {
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      region: process.env.S3_BUCKET_REGION,
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
    };

    const url = await getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: 60 * 60 * 5 }); // 5 Hrs
    return url;
  }

  async deleteFileFromS3(filename: string) {
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      region: process.env.S3_BUCKET_REGION,
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
    };

    try {
      await s3.send(new DeleteObjectCommand(params));
      this._logger.log(`Deleted file from S3: ${filename}`);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
