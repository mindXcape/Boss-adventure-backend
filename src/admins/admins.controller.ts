import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto, UpdateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create new admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get an admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update an admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete an admin' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateAdminDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
