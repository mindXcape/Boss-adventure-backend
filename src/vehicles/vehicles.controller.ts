import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('vehicles')
@ApiBearerAuth('access-token')
@ApiTags('Vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new Vehicle' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: CreateVehicleDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateVehicleDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() query: QueryPackagesDto) {
    return this.vehiclesService.findAll(query);
  }

  @ApiOperation({ summary: 'Find a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateVehicleDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a Vehicle' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateVehicleDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateVehicleDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
