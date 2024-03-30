import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto } from './dto/create-bank.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Banks')
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create bank user' })
  @ApiResponse({
    status: 201,
    description: 'The found record',
    type: [CreateBankDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createBankDto: CreateBankDto) {
    return this.banksService.create(createBankDto);
  }

  @Public()
  @ApiOperation({ summary: 'List all banks' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateBankDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll() {
    return this.banksService.findAll();
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a bank' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateBankDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.banksService.update(id, updateBankDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [CreateBankDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.banksService.remove(id);
  }
}
