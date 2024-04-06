import { IsOptional, IsString } from 'class-validator';

export class QueryLodgeDto {
  @IsString()
  @IsOptional()
  search: string;
}
