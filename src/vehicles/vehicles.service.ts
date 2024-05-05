import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { paginate } from 'src/utils/paginate';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';

@Injectable()
export class VehiclesService {
  private readonly _logger = new Logger('User Services');
  constructor(private prisma: PrismaService, private awsService: AwsService) {}

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

  async create(createVehicleDto: CreateVehicleDto) {
    try {
      this._logger.log(`Creating a new vehicle with model ${createVehicleDto.model}`);
      if (createVehicleDto.number) {
        const doesExit = await this.prisma.vehicle.findFirst({
          where: {
            number: createVehicleDto.number,
          },
        });

        if (doesExit) {
          throw new Error('Vehicle already exists. Vehicle number should be unique.');
        }
      }
      const vehicle = await this.prisma.vehicle.create({
        data: {
          model: createVehicleDto.model,
          image: createVehicleDto.image,
          ...(createVehicleDto.number && { number: createVehicleDto.number }),
        },
      });
      const signedVehicle = await this.getSignedUrl(vehicle);
      return signedVehicle;
    } catch (error) {
      await this.awsService.deleteFileFromS3(createVehicleDto.image);
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: QueryPackagesDto) {
    try {
      this._logger.log(`Fetching all vehicles`);
      const vehicles = await paginate(
        this.prisma.vehicle,
        {
          where: {
            OR: [
              { model: { contains: query.search || '', mode: 'insensitive' } },
              { number: { contains: query.search || '', mode: 'insensitive' } },
            ],
          },
        },
        {
          page: query.page,
          perPage: query.perPage,
        },
      );
      const signedVehicle = await this.getSignedUrl(vehicles.rows);
      return {
        ...vehicles,
        rows: signedVehicle,
      };
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching vehicle with id ${id}`);
      const vehicle = await this.prisma.vehicle.findUnique({
        where: {
          id: id,
        },
      });
      const signedVehicle = await this.getSignedUrl(vehicle);
      return signedVehicle;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    try {
      this._logger.log(`Updating vehicle with id ${id}`);
      const vehicle = await this.prisma.vehicle.findUnique({
        where: {
          id: id,
        },
      });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with id ${id} does not exist`);
      }
      // update the vehicle
      const updatedVehicle = await this.prisma.vehicle.update({
        where: {
          id: id,
        },
        data: {
          model: updateVehicleDto.model || vehicle.model,
          image: updateVehicleDto.image || vehicle.image,
          number: updateVehicleDto.number || vehicle.number,
        },
      });
      const signedVehicle = await this.getSignedUrl(updatedVehicle);
      return signedVehicle;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting vehicle with id ${id}`);
      const vehicle = await this.prisma.vehicle.findUnique({
        where: {
          id: id,
        },
      });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with id ${id} does not exist`);
      }
      await this.prisma.vehicle.delete({
        where: {
          id: id,
        },
      });
      return vehicle;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
