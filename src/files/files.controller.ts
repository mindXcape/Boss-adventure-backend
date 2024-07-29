import { Body, Controller, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadGuard } from './guards/upload.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('files')
@ApiTags('Files')
@UseGuards(UploadGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload file' })
  @Public()
  @Post()
  async uploadFile(@Req() req, @Body() body: any, @Res() res) {
    return await this.filesService.uploadFile(req, res);
  }

  @Public()
  @ApiOperation({ summary: 'Upload file to particular directory' })
  @Post(':folder')
  async uploadFileToFolder(@Req() req, @Param('folder') folder: string, @Res() res) {
    return await this.filesService.uploadFileToFolder(req, folder, res);
  }
}
