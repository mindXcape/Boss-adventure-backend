import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @ApiProperty({ example: 'Toyota' })
  model: string;

  @IsString()
  @ApiProperty({
    example: 'https://www.toyota.com/imgix/responsive/images/mlp/colorizer/2021/corolla/1J9/1.png',
  })
  image: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'BA-KHA-245' })
  number: string;
}
