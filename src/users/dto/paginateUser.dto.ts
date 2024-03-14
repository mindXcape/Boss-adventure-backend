import { IsOptional, IsString } from 'class-validator';

export class PaginateQueryDto {
  @IsString()
  @IsOptional()
  page: number;

  @IsString()
  @IsOptional()
  perPage: number;
}
