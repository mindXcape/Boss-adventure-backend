import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class PaginateQueryDto {
  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  perPage: string;

  @IsString()
  @IsOptional()
  role: Role;

  @IsString()
  @IsOptional()
  name: string;
}
