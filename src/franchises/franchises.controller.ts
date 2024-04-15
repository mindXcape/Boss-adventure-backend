import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FranchisesService } from './franchises.service';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('franchises')
@ApiBearerAuth('access-token')
@ApiTags('Franchises')
export class FranchisesController {
  constructor(private readonly franchisesService: FranchisesService) {}

  @Post()
  create(@Body() createFranchiseDto: CreateFranchiseDto) {
    return this.franchisesService.create(createFranchiseDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.franchisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.franchisesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFranchiseDto: UpdateFranchiseDto) {
    return this.franchisesService.update(id, updateFranchiseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.franchisesService.remove(id);
  }
}
