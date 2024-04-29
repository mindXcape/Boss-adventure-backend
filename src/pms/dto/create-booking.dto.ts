import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateVehicleBookingDto {
  @IsString()
  @ApiProperty({
    description: 'vehicle Id',
    example: '344-sfs-43',
  })
  vehicleId: string;

  @IsString()
  @ApiProperty({
    description: 'Driver Id',
    example: '344-sfs-43',
  })
  driverId: string;

  @IsDate()
  @ApiProperty({
    description: 'Date of booking',
    example: '',
  })
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Comment for booking',
    example: 'Make sure to provide extra bed for children',
  })
  comment: string;

  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Status of booking (PENDING, CONFIRMED, CANCELLED)',
    example: 'PENDING',
  })
  status: BookingStatus;
}
export class CreateBookingDto {
  @IsString()
  @ApiProperty({
    description: 'Group Id',
    example: '344-sfs-43',
  })
  groupId: string;

  @IsDate()
  @ApiProperty({
    description: 'Date of booking',
    example: '',
  })
  date: Date;

  @IsString()
  @ApiProperty({
    description: 'Meal type',
    example: 'D/L',
  })
  meal: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Hotel Id',
    example: '344-sfs-43',
  })
  hotelId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Lodge Id',
    example: '344-sfs-43',
  })
  lodgeId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Comment for booking',
    example: 'Make sure to provide extra bed for children',
  })
  comment: string;

  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Status of booking (PENDING, CONFIRMED, CANCELLED)',
    example: 'PENDING',
  })
  status: BookingStatus;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}
