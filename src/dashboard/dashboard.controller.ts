import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/create-dashboard.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @ApiOperation({ summary: 'List all branches' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Get()
  findAll(@Query() query: QueryDashboardDto) {
    return this.dashboardService.findAll(query);
  }
}
