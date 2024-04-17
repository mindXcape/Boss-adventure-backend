import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PmsService } from './pms.service';
import { CreatePmDto } from './dto/create-pm.dto';
import { UpdatePmDto } from './dto/update-pm.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('pms')
@ApiBearerAuth('access-token')
@ApiTags('Pms')
export class PmsController {
  constructor(private readonly pmsService: PmsService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new PMS' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: CreatePmDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  create(@Body() createPmDto: CreatePmDto) {
    return this.pmsService.create(createPmDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all PMS' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreatePmDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() query: QueryPackagesDto) {
    return this.pmsService.findAll(query);
  }

  @Public()
  @Get('/bookings')
  @ApiOperation({ summary: 'List all bookings' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreatePmDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAllBookings(@Query() query: QueryPackagesDto) {
    return this.pmsService.findAllBookings(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a PMS' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreatePmDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.pmsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a PMS' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UpdatePmDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePmDto: UpdatePmDto) {
    return this.pmsService.update(id, updatePmDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a PMS' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreatePmDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pmsService.remove(id);
  }
}
