import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PmsService } from './pms.service';
import { CreatePmDto } from './dto/create-pm.dto';
import { UpdatePmDto } from './dto/update-pm.dto';

@Controller('pms')
export class PmsController {
  constructor(private readonly pmsService: PmsService) {}

  @Post()
  create(@Body() createPmDto: CreatePmDto) {
    return this.pmsService.create(createPmDto);
  }

  @Get()
  findAll() {
    return this.pmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pmsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePmDto: UpdatePmDto) {
    return this.pmsService.update(+id, updatePmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pmsService.remove(+id);
  }
}
