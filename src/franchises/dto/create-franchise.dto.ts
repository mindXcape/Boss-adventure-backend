import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFranchiseDto {
  @IsString()
  @ApiProperty({
    description: 'Name of franchise',
    example: 'Everest franchise',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Image of franchise',
    example: 'https://google.com',
  })
  image: string;
}
