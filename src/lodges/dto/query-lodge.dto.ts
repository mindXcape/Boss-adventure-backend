import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryLodgeDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description: 'Search for a lodge | branch name | address',
    example: 'Koteshor',
  })
  search: string;
}
