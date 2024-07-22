import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Designation, Role, Status } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export class CreateAssetsDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Citizenship image of the user',
    example: 'https://example.com/image.jpg',
  })
  citizenshipImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'passport image of the user',
    example: 'https://example.com/image.jpg',
  })
  passportImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Pan card image of the user',
    example: 'https://example.com/image.jpg',
  })
  panCardImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'National id image of the user',
    example: 'https://example.com/image.jpg',
  })
  nationIdImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Nam book image of the user',
    example: 'https://example.com/image.jpg',
  })
  namBookImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Guide license image of the user',
    example: 'https://example.com/image.jpg',
  })
  guideLicenseImg: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'CV image of the user',
    example: 'https://example.com/image.jpg',
  })
  cvImg: string;
}

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
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Gender of the user',
    example: 'Male | Female | Other',
  })
  gender: string;

  // validate if the value is in the Role enum
  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @ValidateIf((object, value) => value in Role)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Array of roles associated with the user',
    example: 'USER',
  })
  role: Role;

  @IsEmail()
  @IsOptional()
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
  @IsOptional()
  @ApiProperty({
    description: 'Contact number of user',
    example: '9808986617',
  })
  phone: string;

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
    description: 'Designation of the user',
    example: 'ACCOUNT',
  })
  designation: Designation;

  @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
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
    description: 'Language of the user',
    example: 'Nepali',
  })
  language: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Category of the user',
    example: 'ABC',
  })
  category: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Address of the user',
    example: 'Koteshor - 17, Kathmandu, Nepal',
  })
  address: string;

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

  // Professional Information
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
    description: 'Pan number of user',
    example: 'afa',
  })
  panNumber: string;

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
    description: 'National Id Number of the user',
    example: 'CA22555',
  })
  nationalIdNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Guide license of the user',
    example: 'RAC78',
  })
  guideLicense: string;

  // convert date to ISO-8601 format
  @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'nma date of a guide license',
    example: '2083-1-1',
  })
  nma: string;

  @Transform(({ value }) => new Date(value).toISOString(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Date of expire guide license',
    example: '2083-1-1',
  })
  guideLicenseExpire: string;

  @IsOptional()
  @ApiProperty({
    description: 'Asset of the user',
    type: `
    {
      citizenshipImg: string;
      panCardImg: string;
      nationIdImg: string;
      namBookImg: string;
      guideLicenseImg: string;
      cvImg: string;
    }
    `,
  })
  asset: CreateAssetsDto;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
