import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class UploadGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest() as FastifyRequest;
    const isMultipart = req.isMultipart();
    if (!isMultipart) throw new BadRequestException('multipart/form-data expected.');

    const file = await req.file();
    if (!file) throw new BadRequestException('file expected');

    const fileSizeLimit = 5 * 1024 * 1024; // Adjust the file size limit as needed
    if (file['size'] > fileSizeLimit) {
      throw new BadRequestException('File size exceeds the limit.');
    }

    req['incomingFile'] = file;
    req['fileSize'] = file['size'];
    return true;
  }
}
