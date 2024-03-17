import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Full Name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Contact number of user',
    example: '9808986617',
  })
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Profile image of the user',
    example: 'https://example.com/image.jpg',
  })
  profileImage: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Current status of the user',
    example: 'Active | Pending | Blocked | Inactive | Deleted',
  })
  status: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Country of the user',
    example: 'Nepal',
  })
  country: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'State of the user',
    example: 'Bagmati',
  })
  state: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'City of the user',
    example: 'Kathmandu',
  })
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Address of the user',
    example: 'Koteshor - 17',
  })
  address: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Zip code of the user',
    example: '44600',
  })
  zipCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Company name of the user',
    example: 'ABC Pvt. Ltd.',
  })
  companyName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Passport number of the user',
    example: 'CA22555',
  })
  passportNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Occupation of the user',
    example: 'Sales',
  })
  occupation: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
