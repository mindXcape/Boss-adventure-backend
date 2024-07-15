import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryDashboardDto {
  @IsString()
  @ApiProperty({
    required: true,
    description: 'Filter start date',
    example: '2024/01/01',
  })
  startDate: string;

  @IsString()
  @ApiProperty({
    required: true,
    description: 'Filter end date',
    example: '2024/01/01',
  })
  endDate: string;
}
