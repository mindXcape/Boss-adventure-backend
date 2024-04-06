import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryHotelDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Search for a hotel | branch name | address',
    example: 'Koteshor',
  })
  search: string;
}
