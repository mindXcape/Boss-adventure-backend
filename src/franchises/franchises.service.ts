import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class FranchisesService {
  private readonly _logger = new Logger('Franchise Services');
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private async getSignedUrl(items: any[] | any) {
    if (Array.isArray(items)) {
      return await Promise.all(
        items.map(async item => {
          if (item.image === null) return item;
          const url = await this.awsService.getSignedUrlFromS3(item.image);
          return { ...item, image: url };
        }),
      );
    }
    if (items.image === null) return items;
    const url = await this.awsService.getSignedUrlFromS3(items.image);
    return { ...items, image: url };
  }
  async create(createFranchiseDto: CreateFranchiseDto) {
    try {
      this._logger.log(`Creating a new franchise with name ${createFranchiseDto.name}`);
      const franchise = await this.prismaService.franchise.create({
        data: createFranchiseDto,
      });
      return this.getSignedUrl(franchise);
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      this._logger.log('Fetching all franchises');
      const franchises = await this.prismaService.franchise.findMany();
      return await this.getSignedUrl(franchises);
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching franchise with id ${id}`);
      const franchise = await this.prismaService.franchise.findUnique({
        where: {
          id,
        },
      });
      return await this.getSignedUrl(franchise);
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateFranchiseDto: UpdateFranchiseDto) {
    try {
      this._logger.log(`Updating franchise with id ${id}`);
      const doesExist = await this.prismaService.franchise.findUnique({
        where: {
          id,
        },
      });
      if (!doesExist) {
        throw new BadRequestException('Franchise does not exist');
      }
      const franchise = await this.prismaService.franchise.update({
        where: {
          id,
        },
        data: updateFranchiseDto,
      });
      return this.getSignedUrl(franchise);
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting franchise with id ${id}`);
      const doesExist = await this.prismaService.franchise.findUnique({
        where: {
          id,
        },
      });
      if (!doesExist) {
        throw new BadRequestException('Franchise does not exist');
      }
      return await this.prismaService.franchise.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this._logger.error(error.message);

      throw new BadRequestException(error.message);
    }
  }
}
