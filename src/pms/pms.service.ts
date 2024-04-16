import { Injectable } from '@nestjs/common';
import { CreatePmDto } from './dto/create-pm.dto';
import { UpdatePmDto } from './dto/update-pm.dto';

@Injectable()
export class PmsService {
  create(createPmDto: CreatePmDto) {
    return 'This action adds a new pm';
  }

  findAll() {
    return `This action returns all pms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pm`;
  }

  update(id: number, updatePmDto: UpdatePmDto) {
    return `This action updates a #${id} pm`;
  }

  remove(id: number) {
    return `This action removes a #${id} pm`;
  }
}
