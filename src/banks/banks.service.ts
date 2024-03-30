import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBankDto, UpdateBankDto } from './dto/create-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}
  async create(createBankDto: CreateBankDto) {
    try {
      const bank = await this.prisma.bank.create({
        data: createBankDto,
      });
      return bank;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const banks = await this.prisma.bank.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      return banks;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    try {
      const { name, class: className } = updateBankDto;

      const bank = await this.prisma.bank.findUnique({
        where: { id },
      });

      if (!bank) throw new BadRequestException('Bank not found');

      const updatedBank = await this.prisma.bank.update({
        where: { id },
        data: {
          name: name || bank.name,
          class: className || bank.class,
        },
      });
      return updatedBank;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const bank = await this.prisma.bank.findUnique({
        where: { id },
      });
      if (!bank) throw new BadRequestException('Bank not found');

      const deletedBank = await this.prisma.bank.delete({
        where: { id },
      });
      return deletedBank;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
