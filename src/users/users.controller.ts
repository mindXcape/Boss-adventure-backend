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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateBankDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginateQueryDto } from './dto/paginateUser.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get('/allUsers')
  getAll(@Query() query: PaginateQueryDto) {
    return this.usersService.getAll(query);
  }

  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'List all user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() query: PaginateQueryDto) {
    return this.usersService.findAll(query);
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateUserDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Roles('ADMIN')
  @Post(':userId/bank')
  @ApiOperation({ summary: 'Add new bank details to user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createOneBank(@Param('userId') userId: string, @Body() createBankDto: CreateBankDto) {
    if (!userId) {
      throw new BadRequestException('Id is required in params');
    }
    return this.usersService.createOneBank(userId, createBankDto);
  }
  @Roles('ADMIN')
  @Post(':userId/banks')
  @ApiOperation({ summary: 'Add many new banks details to user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createManyBank(@Param('userId') userId: string, @Body() createBankDto: Array<CreateBankDto>) {
    if (!userId) {
      throw new BadRequestException('Id is required in params');
    }
    return this.usersService.createManyBank(userId, createBankDto);
  }
}
