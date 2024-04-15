import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { QueryPackagesDto } from './dto/query-package.dto';

@Controller('packages')
@ApiBearerAuth('access-token')
@ApiTags('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Public()
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryPackagesDto) {
    return this.packagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
