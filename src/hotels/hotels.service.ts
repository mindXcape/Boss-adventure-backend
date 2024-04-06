import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateHotelBranchDto, CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelBranchDto, UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';
import { QueryHotelDto } from './dto/query-hotel.dto';

@Injectable()
export class HotelsService {
  private readonly _logger = new Logger('Hotel Services');
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

  async create(createHotelDto: CreateHotelDto) {
    const { branches, image, hotelName } = createHotelDto;
    try {
      this._logger.log(`Creating new hotel: ${hotelName}`);
      let hotelId = '';
      await this.prismaService.$transaction(async tx => {
        const hotel = await tx.hotel.create({
          data: {
            name: hotelName,
            image,
          },
        });

        for (const branch of branches) {
          const { branchName, ...rest } = branch;
          await tx.hotelBranch.create({
            data: {
              name: branchName,
              hotelId: hotel.id,
              ...rest,
            },
          });
        }
        hotelId = hotel.id;
      });
      const hotel = await this.prismaService.hotel.findUnique({
        where: { id: hotelId },
        include: { branch: true },
      });
      return await this.getSignedUrl(hotel);
    } catch (error) {
      this._logger.error(`Error while creating hotel: ${error}`);
      await this.awsService.deleteFileFromS3(image);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      this._logger.log(`Fetching all hotels`);
      const hotels = await this.prismaService.hotel.findMany({
        include: {
          branch: true,
        },
      });
      const result = await this.getSignedUrl(hotels);

      return await Promise.all(result);
    } catch (error) {
      this._logger.error(`Error while fetching all hotels: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching hotel with id: ${id}`);
      const hotel = await this.prismaService.hotel.findUnique({
        where: { id },
        include: {
          branch: true,
        },
      });
      if (!hotel) {
        throw new BadRequestException('Hotel does not exist');
      }
      const result = await this.getSignedUrl(hotel);

      return result;
    } catch (error) {
      this._logger.error(`Error while fetching hotel: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateHotelDto: UpdateHotelDto) {
    try {
      const hotel = await this.prismaService.hotel.findUnique({ where: { id } });
      if (!hotel) {
        throw new BadRequestException('Hotel does not exist');
      }
      const updatedHotel = await this.prismaService.hotel.update({
        where: { id },
        data: {
          name: updateHotelDto.hotelName || hotel.name,
          image: updateHotelDto.image || hotel.image,
        },
        include: { branch: true },
      });
      const results = await this.getSignedUrl(updatedHotel);

      return results;
    } catch (error) {
      this._logger.error(`Error while updating hotel: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async updateBranch(branchId: string, updateHotelDto: UpdateHotelBranchDto) {
    const { branchName, ...rest } = updateHotelDto;
    try {
      const branch = await this.prismaService.hotelBranch.findUnique({ where: { id: branchId } });
      if (!branch) {
        throw new BadRequestException('Branch does not exist');
      }

      this._logger.log(`Updating hotel branch of id ${branchId}`);
      const updatedBranch = await this.prismaService.hotelBranch.update({
        where: { id: branchId },
        data: {
          name: branchName || branch.name,
          ...rest,
        },
        include: {
          hotel: true,
        },
      });
      const hotel = await this.getSignedUrl(updatedBranch.hotel);

      return {
        ...updatedBranch,
        hotel,
      };
    } catch (error) {
      this._logger.error(`Error while updating branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async addNewBranches(hotelId: string, createHotelBranchDto: CreateHotelBranchDto[]) {
    try {
      this._logger.log(`Adding new branches to hotel with id: ${hotelId}`);
      const hotel = await this.prismaService.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) {
        throw new BadRequestException('Hotel does not exist');
      }
      await this.prismaService.$transaction(async tx => {
        for (const branch of createHotelBranchDto) {
          const { branchName, ...rest } = branch;
          await tx.hotelBranch.create({
            data: {
              name: branchName,
              hotelId,
              ...rest,
            },
          });
        }
      });
      const newHotel = await this.prismaService.hotel.findUnique({
        where: { id: hotelId },
        include: { branch: true },
      });
      const result = await this.getSignedUrl(newHotel);
      return result;
    } catch (error) {
      this._logger.error(`Error while adding new branches: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async getAllBranches(query: QueryHotelDto) {
    try {
      this._logger.log(`Fetching all branches`);
      const branches = await this.prismaService.hotelBranch.findMany({
        where: {
          OR: [
            { name: { contains: query.search || '', mode: 'insensitive' } },
            { address: { contains: query.search || '', mode: 'insensitive' } },
            { hotel: { name: { contains: query.search || '', mode: 'insensitive' } } },
          ],
        },
        include: { hotel: true },
      });
      const result = branches.map(async branch => {
        const hotel = await this.getSignedUrl(branch.hotel);
        return {
          ...branch,
          hotel,
        };
      });
      return Promise.all(result);
    } catch (error) {
      this._logger.error(`Error while fetching all branches: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async getBranch(branchId: string) {
    try {
      this._logger.log(`Fetching branch with id: ${branchId}`);
      const branch = await this.prismaService.hotelBranch.findUnique({
        where: { id: branchId },
        include: { hotel: true },
      });
      if (!branch) {
        throw new BadRequestException('Branch does not exist');
      }
      const hotel = await this.getSignedUrl(branch.hotel);

      return {
        ...branch,
        hotel,
      };
    } catch (error) {
      this._logger.error(`Error while fetching branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async addNewBranch(hotelId: string, createHotelBranchDto: CreateHotelBranchDto) {
    try {
      const hotel = await this.prismaService.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) {
        throw new BadRequestException('Hotel does not exist');
      }
      const { branchName, ...branch } = createHotelBranchDto;
      const newBranch = await this.prismaService.hotelBranch.create({
        data: {
          name: branchName,
          hotelId,
          ...branch,
        },
      });
      return newBranch;
    } catch (error) {
      this._logger.error(`Error while adding new branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async removeBranch(branchId: string) {
    try {
      this._logger.log(`Deleting branch with id: ${branchId}`);
      const branch = await this.prismaService.hotelBranch.findUnique({ where: { id: branchId } });
      if (!branch) {
        throw new BadRequestException('Hotel branch does not exist');
      }
      const deletedBranch = await this.prismaService.hotelBranch.delete({
        where: { id: branchId },
      });
      return deletedBranch;
    } catch (error) {
      this._logger.error(`Error while deleting branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async removeBranches(hotelId: string) {
    try {
      this._logger.log(`Deleting all branches of hotel with id: ${hotelId}`);
      const doesHotelExist = await this.prismaService.hotel.findUnique({ where: { id: hotelId } });
      if (!doesHotelExist) {
        throw new BadRequestException('Hotel does not exist');
      }
      await this.prismaService.hotelBranch.deleteMany({ where: { hotelId } });
      return await this.prismaService.hotel.findUnique({
        where: { id: hotelId },
        include: { branch: true },
      });
    } catch (error) {
      this._logger.error(`Error while deleting all branches: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting hotel with id: ${id}`);
      const doesHotelExist = await this.prismaService.hotel.findUnique({ where: { id } });
      if (!doesHotelExist) {
        throw new BadRequestException('Hotel does not exist');
      }
      const hotel = await this.prismaService.hotel.delete({ where: { id } });

      if (hotel.image) {
        await this.awsService.deleteFileFromS3(hotel.image);
      }

      return hotel;
    } catch (error) {
      this._logger.error(`Error while deleting hotel: ${error}`);
      throw new BadRequestException(error.message);
    }
  }
}
