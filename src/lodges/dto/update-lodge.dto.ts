import { PartialType } from '@nestjs/swagger';
import { CreateLodgeDto } from './create-lodge.dto';

export class UpdateLodgeDto extends PartialType(CreateLodgeDto) {}
