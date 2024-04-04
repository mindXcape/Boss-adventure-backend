import { PartialType } from '@nestjs/swagger';
import { CreateHotelDto, CreateHotelBranchDto } from './create-hotel.dto';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}
export class UpdateHotelBranchDto extends PartialType(CreateHotelBranchDto) {}
