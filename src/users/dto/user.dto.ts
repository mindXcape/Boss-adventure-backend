import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Designation, Role, Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateBankDto {
  @IsString()
  @ApiProperty({
    description: 'Label of the bank account',
    example: 'Primary bank | Salary account | Saving account',
  })
  label: string;

  @IsString()
  @ApiProperty({
    description: 'NIC Asia',
    example: 'John Doe',
  })
  bankName: string;

  @IsString()
  @ApiProperty({
    description: 'Account number',
    example: '208909875948237509',
  })
  accountNo: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Account number',
    example: '208909875948237509',
  })
  branch: string;
}

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
    description: 'Pan number of user',
    example: 'afa',
  })
  panNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Profile image url of the user',
    example: 'https://example.com/image.jpg',
  })
  profileImage: string;

  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Current status of the user',
    example: 'Active | Pending | Blocked | Inactive | Deleted',
  })
  status: Status;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Date of birth of the user',
    example: '2012-12-12',
  })
  dob: string;

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
    description: 'Passport expire date of the user',
    example: '2024-05-04',
  })
  passportExpire: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Uuid of the bank account',
    example: '2124`',
  })
  bankId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Account number',
    example: 'CA22555',
  })
  accountNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Designation of the user',
    example: 'ACCOUNT',
  })
  designation: Designation;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Citizen number of the user',
    example: 'CA22555',
  })
  citizenNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Guide license of the user',
    example: 'RAC78',
  })
  guide_license: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'nma date of a guide license',
    example: '2083-1-1',
  })
  nma: string;

  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Array of roles associated with the user',
    example: 'USER',
  })
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
