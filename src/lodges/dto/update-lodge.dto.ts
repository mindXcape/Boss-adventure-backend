import { PartialType } from '@nestjs/swagger';
import { CreateLodgeBranchDto, CreateLodgeDto } from './create-lodge.dto';

export class UpdateLodgeDto extends PartialType(CreateLodgeDto) {}
export class UpdateLodgeBranchDto extends PartialType(CreateLodgeBranchDto) {}
