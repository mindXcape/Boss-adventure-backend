import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ActivityDto {
  @IsString()
  @ApiProperty({
    description: 'Activity name',
    example: 'Sightseeing tour',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Date at which the activity will take place',
    example: '2022-12-31T23:59:59.999Z',
  })
  date: Date;

  @IsString()
  @ApiProperty({
    description: 'Description of the activity',
    example: 'Explore famous landmarks in the city',
  })
  description: string;

  @IsString()
  @ApiProperty({
    description: 'Meal of the activity',
    example: 'D/B/L',
  })
  meal: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Hotel where the activity will take place',
    example: '2b2cxl30-123132-123123',
  })
  hotelId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Lodge where the activity will take place',
    example: '2b2cxl30-123132-123123',
  })
  lodgeId: string;
}

export class CreatePackageDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the package',
    example: 'Mount peak tour',
  })
  name: string;

  @IsNumber()
  @ApiProperty({
    description: 'Duration of the package in days',
    example: '15',
  })
  duration: number;

  @IsString()
  @ApiProperty({
    description: 'Franchise ID to which the package belongs to',
    example: '2b2cxl30-123132-123123',
  })
  franchiseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDto)
  @ApiProperty({
    description: 'List of activities in the package',
  })
  description: ActivityDto[];
}
