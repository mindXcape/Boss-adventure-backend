import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LodgesService } from './lodges.service';
import { CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeDto } from './dto/update-lodge.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateHotelDto } from 'src/hotels/dto/create-hotel.dto';

@Controller('lodges')
@ApiBearerAuth('access-token')
@ApiTags('Lodges')
export class LodgesController {
  constructor(private readonly lodgesService: LodgesService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new lodge (Not implemented)' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Post()
  create(@Body() createLodgeDto: CreateLodgeDto) {
    return this.lodgesService.create(createLodgeDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all lodges (Not implemented)' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Get()
  findAll() {
    return this.lodgesService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Find one lodge (Not implemented)' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lodgesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update lodge (Not implemented)' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLodgeDto: UpdateLodgeDto) {
    return this.lodgesService.update(+id, updateLodgeDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete lodge (Not implemented)' })
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.lodgesService.remove(+id);
  }
}
