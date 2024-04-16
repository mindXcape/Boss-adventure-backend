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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('groups')
@ApiBearerAuth('access-token')
@ApiTags('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create new Group' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: CreateGroupDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all Groups' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateGroupDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() query: QueryPackagesDto) {
    return this.groupsService.findAll(query);
  }

  @Public()
  @ApiOperation({ summary: 'Find a Group' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateGroupDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a Group' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: UpdateGroupDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a Group' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateGroupDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
