import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @ApiProperty({
    description: 'Unique Group ID',
    example: '2022-B-4',
  })
  groupId: string;

  @IsArray()
  @ApiProperty({
    description: 'Array of user Ids',
    example: "['asfaf', 'asfasf', 'asfasf']",
  })
  clients: string[];
}
