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
import { LodgesService } from './lodges.service';
import { CreateLodgeBranchDto, CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeBranchDto, UpdateLodgeDto } from './dto/update-lodge.dto';
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
  @ApiOperation({ summary: 'Create new lodge' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Post()
  create(@Body() createLodgeDto: CreateLodgeDto) {
    return this.lodgesService.create(createLodgeDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new lodge branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @Post(':id/branches')
  createBranch(@Param('id') id: string, @Body() createLodgeBranchDto: CreateLodgeBranchDto) {
    if (!id) {
      throw new BadRequestException('Lodge id is required');
    }
    return this.lodgesService.addNewBranch(id, createLodgeBranchDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all lodges' })
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
  @ApiOperation({ summary: 'List all branches' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateLodgeBranchDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('branches')
  findAllBranches() {
    return this.lodgesService.getAllBranches();
  }

  @Public()
  @ApiOperation({ summary: 'Find a Lodge' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateLodgeDto],
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Lodge id is required');
    }
    return this.lodgesService.findOne(id);
  }

  @Public()
  @ApiOperation({ summary: 'Find a Lodge Branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateLodgeBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('branches/:id')
  findOneBranch(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Branch id is required');
    }
    return this.lodgesService.getBranch(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a lodge' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateLodgeDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLodgeDto: UpdateLodgeDto) {
    if (!id) {
      throw new BadRequestException('Lodge id is required');
    }
    return this.lodgesService.update(id, updateLodgeDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a lodge branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UpdateLodgeBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch('branch/:branchId')
  updateBranch(@Param('branchId') id: string, @Body() updateLodgeBranchDto: UpdateLodgeBranchDto) {
    return this.lodgesService.updateBranch(id, updateLodgeBranchDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete lodge' })
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateHotelDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.lodgesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete all branches of a lodge' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateLodgeBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id/branches')
  removeBranches(@Param('id') id: string) {
    return this.lodgesService.removeBranches(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a Lodge branch' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateLodgeBranchDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete('branch/:branchId')
  removeBranch(@Param('branchId') id: string) {
    return this.lodgesService.removeBranch(id);
  }
}
