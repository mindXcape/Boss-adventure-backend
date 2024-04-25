import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsObject, ValidateNested } from 'class-validator';

export class CreatePmDto {
  @IsString()
  @ApiProperty({
    description: 'Group Id',
    example: '344-sfs-43',
  })
  groupId: string;

  @IsString()
  @ApiProperty({
    description: 'Guide Id',
    example: '344-sfs-43',
  })
  guideId: string;

  @IsString()
  @ApiProperty({
    description: 'Leader Id',
    example: '344-sfs-43',
  })
  leaderId: string;

  @IsString()
  @ApiProperty({
    description: 'Package Id',
    example: '344-sfs-43',
  })
  packageId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PmsActivitiesDto)
  @ApiProperty({
    description: 'List of activities in the package',
  })
  activities: PmsActivitiesDto[];

  @IsObject()
  @IsOptional()
  @ApiProperty({
    description: 'Additional information',
    example: `
    {
      arrival: {
        date: '2022-12-31T23:59:59.999Z',
        flightNumber: 'KHA-2-053',
        from: 'Yangon',
        to: 'Mandalay',
      }
      departure: {
        date: '2022-12-31T23:59:59.999Z',
        flightNumber: 'KHA-2-053',
        from: 'Mandalay',
        to: 'Yangon',
      }
    }
    `,
  })
  additionalInfo: any;
}

export class PmsActivitiesDto {
  @IsString()
  @ApiProperty({
    description: 'Activity name',
    example: 'Sightseeing tour',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Date at which the activity will take place',
    example: '2022-12-31T23:59:59.999Z',
  })
  date: Date;

  @IsString()
  @ApiProperty({
    description: 'Description of the activity',
    example: 'Explore famous landmarks in the city',
  })
  description: string;

  @IsString()
  @ApiProperty({
    description: 'Meal of the activity',
    example: 'D/B/L',
  })
  meal: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Hotel where the activity will take place',
    example: '2b2cxl30-123132-123123',
  })
  hotelId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Lodge where the activity will take place',
    example: '2b2cxl30-123132-123123',
  })
  lodgeId: string;

  @IsString()
  @ApiProperty({
    description: 'Activity transfer type',
    example: 'DRIVE | Flight | Trekking ',
  })
  transfer: string;

  @IsOptional()
  @ApiProperty({
    example: `
      "transferDetails": {
        "transferType": "DRIVE",
        "vehicleNumber": "KHA-2-053",
        "driverId": "sfs-asfsa-5saf-afsaf",
        "from": "Airport",
        "to": "Hotel",
        "hiringCompany": "Yangon Taxi Service",
      }
      "transferDetails": {
        "transferType": "FLIGHT",
        "flightNumber": "KHA-2-053",
        "from": "Airport",
        "to": "Hotel",
      }
    `,
    description: 'Json Details of the transfer',
  })
  transferDetails: any;
}
