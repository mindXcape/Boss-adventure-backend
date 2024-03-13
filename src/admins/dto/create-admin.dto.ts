import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
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

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Array of roles associated with the user',
    example: '["USER"]',
  })
  roles: [];
}

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
