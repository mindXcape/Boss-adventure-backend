import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class CreateHotelBranchDto {
  @IsString()
  @ApiProperty({
    description: 'Name of hotel branch',
    example: 'Everest Hotel | Kathmandu',
  })
  branchName: string;

  @IsString()
  @ApiProperty({
    description: 'Name of hotel branch',
    example: 'Everest Hotel | Kathmandu',
  })
  image: string;

  @IsString()
  @ApiProperty({
    description: 'Hotel branch City',
    example: 'Kathmandu',
  })
  city: string;

  @IsString()
  @ApiProperty({
    description: 'Hotel branch state',
    example: 'Bagmati',
  })
  state: string;

  @IsString()
  @ApiProperty({
    description: 'Hotel branch City',
    example: 'Kathmandu',
  })
  address: string;

  @IsString()
  @ApiProperty({
    description: 'Contact of hotel branch',
    example: '9812345678',
  })
  phone: string;

  @IsString()
  @ApiProperty({
    description: 'Name of Point of Contact (Person name)',
    example: 'John Doe',
  })
  poc: string;

  @IsString()
  @ApiProperty({
    description: 'Phone of Point of Contact (phone number)',
    example: '9812345678',
  })
  pocPhone: string;

  @IsString()
  @ApiProperty({
    description: 'Designation of Point of Contact (phone number)',
    example: '9812345678',
  })
  pocDesignation: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: 'Email of hotel branch',
    example: 'example@gmail.com',
  })
  email: string;
}

export class CreateHotelDto {
  @IsString()
  @ApiProperty({
    description: 'Name of hotel',
    example: 'Everest Hotel',
  })
  hotelName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBranchDto)
  branches: CreateHotelBranchDto[];
}
