import { Injectable } from '@nestjs/common';
import { CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeDto } from './dto/update-lodge.dto';

@Injectable()
export class LodgesService {
  create(createLodgeDto: CreateLodgeDto) {
    return 'This action adds a new lodge';
  }

  findAll() {
    return `This action returns all lodges`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lodge`;
  }

  update(id: number, updateLodgeDto: UpdateLodgeDto) {
    return `This action updates a #${id} lodge`;
  }

  remove(id: number) {
    return `This action removes a #${id} lodge`;
  }
}
