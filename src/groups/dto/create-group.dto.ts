import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @ApiProperty({
    description: 'Unique Group ID',
    example: '2022-B-4',
  })
  groupId: string;

  @IsArray()
  @ApiProperty({
    description: 'Array of user',
    example: "['asfaf', 'asfasf', 'asfasf']",
  })
  @ValidateNested({ each: true })
  @Type(() => UsersOnGroupDto)
  clients: UsersOnGroupDto[];
}

export class UsersOnGroupDto {
  @IsString()
  @ApiProperty({
    description: 'client Id',
    example: '2022-B-4',
  })
  clientId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Number of rooms booked',
    example: '1 Double',
  })
  rooms: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Extension number',
    example: 'Any comment goes here',
  })
  extension: string;
}
