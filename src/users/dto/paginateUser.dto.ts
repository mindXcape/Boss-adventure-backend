import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class PaginateQueryDto {
  @IsString()
  @IsOptional()
  page: string;

  @IsString()
  @IsOptional()
  perPage: string;

  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  @IsString()
  @IsOptional()
  role: Role;

  @IsString()
  @IsOptional()
  name: string;
}
