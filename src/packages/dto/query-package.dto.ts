import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryPackagesDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Search for a package | franchise name',
    example: 'Mount tour',
  })
  search: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The page number',
    required: false,
    default: '1',
    example: 1,
  })
  page: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The number of items per page',
    required: false,
    default: '10',
    example: 10,
  })
  perPage: string;
}
