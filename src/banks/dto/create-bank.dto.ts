import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBankDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the bank',
    example: 'Siddhartha Bank Ltd',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Class of bank',
    example: 'john@doe.com',
  })
  class: string;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
