import { IsOptional, IsString } from 'class-validator';

export class QueryHotelDto {
  @IsString()
  @IsOptional()
  search: string;
}
