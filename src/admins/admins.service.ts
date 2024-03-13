import { Injectable, Logger } from '@nestjs/common';
import { CreateAdminDto, UpdateAdminDto } from './dto/create-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminsService {
  private readonly _logger = new Logger('Admin Services');
  constructor(private prisma: PrismaService) {}

  create(createAdminDto: CreateAdminDto) {
    this._logger.log(`Creating new admin: ${createAdminDto?.email}`);

    return this.prisma.admin.create({
      data: {
        ...createAdminDto,
      },
    });
  }

  findAll() {
    this._logger.log(`Finding all admins`);

    return this.prisma.admin.findMany({ where: { isActive: true } });
  }

  findOne(id: string) {
    this._logger.log(`Finding admin: ${id}`);

    return this.prisma.admin.findUnique({
      where: { id },
    });
  }

  update(id: string, updateAdminDto: UpdateAdminDto) {
    this._logger.log(`Updating admin: ${id}`);

    return this.prisma.admin.update({
      where: {
        id,
      },
      data: {
        ...updateAdminDto,
      },
    });
  }

  remove(id: string) {
    this._logger.log(`Removing admin: ${id}`);

    return this.prisma.admin.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async findOneByEmail(email: string): Promise<any> {
    return await this.prisma.admin.findUnique({
      where: { email },
    });
  }
}
