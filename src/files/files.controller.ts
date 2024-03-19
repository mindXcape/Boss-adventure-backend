import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadGuard } from './guards/upload.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('files')
@UseGuards(UploadGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Post()
  async uploadFile(@Req() req, @Body() body: any, @Res() res) {
    return await this.filesService.uploadFile(req, res);
  }
}
