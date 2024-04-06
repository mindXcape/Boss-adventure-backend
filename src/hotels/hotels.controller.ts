import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelBranchDto, CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelBranchDto, UpdateHotelDto } from './dto/update-hotel.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('hotels')
@ApiBearerAuth('access-token')
@ApiTags('Hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create new Hotel' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all hotels' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'List all branches' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelBranchDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('branches')
  findAllBranches() {
    return this.hotelsService.getAllBranches();
  }

  @Public()
  @ApiOperation({ summary: 'Find a Hotel' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Hotel id is required');
    }
    return this.hotelsService.findOne(id);
  }

  @Public()
  @ApiOperation({ summary: 'Find a Branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('branches/:id')
  findOneBranch(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Branch id is required');
    }
    return this.hotelsService.getBranch(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a Hotel' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    if (!id) {
      throw new BadRequestException('Hotel id is required');
    }
    return this.hotelsService.update(id, updateHotelDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add multiple branches' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post(':id/branches')
  createNewBranches(@Param('id') id: string, @Body() createHotelBranches: CreateHotelBranchDto[]) {
    return this.hotelsService.addNewBranches(id, createHotelBranches);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a Hotel hotel branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch('branch/:branchId')
  updateBranch(@Param('branchId') id: string, @Body() updateHotelBranchDto: UpdateHotelBranchDto) {
    return this.hotelsService.updateBranch(id, updateHotelBranchDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a Hotel' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete all branches of a hotel' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id/branches')
  removeBranches(@Param('id') id: string) {
    return this.hotelsService.removeBranches(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a Hotel branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateHotelBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete('branch/:branchId')
  removeBranch(@Param('branchId') id: string) {
    return this.hotelsService.removeBranch(id);
  }
}
