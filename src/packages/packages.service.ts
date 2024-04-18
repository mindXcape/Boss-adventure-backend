import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryPackagesDto } from './dto/query-package.dto';
import { paginate } from 'src/utils/paginate';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class PackagesService {
  private readonly _logger = new Logger('Package Services');
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

  async create(createPackageDto: CreatePackageDto) {
    try {
      this._logger.log(`Creating a new package with name ${createPackageDto.name}`);
      const doesExit = await this.prismaService.franchisePackages.findUnique({
        where: {
          name: createPackageDto.name,
        },
      });
      if (doesExit) {
        throw new Error('Package already exists. Package name should be unique.');
      }
      const validFranchise = await this.prismaService.franchise.findUnique({
        where: {
          id: createPackageDto.franchiseId,
        },
      });
      if (!validFranchise) {
        throw new Error('Franchise does not exist');
      }
      const activities = {
        activity: [],
      };
      for (const data of createPackageDto.description) {
        if (data.lodgeId && data.hotelId) {
          throw new BadRequestException('You cannot select both hotel and lodge');
        }
        activities.activity.push(data);
      }
      const createdPackage = await this.prismaService.franchisePackages.create({
        data: {
          name: createPackageDto.name,
          duration: createPackageDto.duration,
          franchiseId: createPackageDto.franchiseId,
          description: activities,
        },
        include: {
          franchise: true,
        },
      });
      return createdPackage;
    } catch (error) {
      this._logger.error(`Error in creating package: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async findAll(query: QueryPackagesDto) {
    try {
      this._logger.log('Fetching all packages');
      const allPackages = await paginate(
        this.prismaService.franchisePackages,
        {
          where: {
            OR: [
              { name: { contains: query.search || '', mode: 'insensitive' } },
              { franchise: { name: { contains: query.search || '', mode: 'insensitive' } } },
            ],
          },
          include: { franchise: true },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );
      const result = allPackages.rows.map(async (item: any) => {
        const franchise = await this.getSignedUrl(item.franchise);
        return { ...item, franchise };
      });

      return {
        ...allPackages,
        rows: await Promise.all(result),
      };
    } catch (error) {
      this._logger.error(`Error in Updating package: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async findOne(id: string) {
    this._logger.log(`Fetching package with id ${id}`);

    return await this.prismaService.franchisePackages.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updatePackageDto: UpdatePackageDto) {
    try {
      const oldPackage = await this.prismaService.franchisePackages.findUnique({
        where: {
          id,
        },
      });
      if (!oldPackage) {
        throw new Error('Package does not exist');
      }
      this._logger.log(`Updating package with id ${id}`);
      const activities = {
        activity: [],
      };
      for (const data of updatePackageDto.description) {
        activities.activity.push(data);
      }
      return await this.prismaService.franchisePackages.update({
        where: {
          id,
        },
        data: {
          name: updatePackageDto.name || oldPackage.name,
          duration: updatePackageDto.duration || oldPackage.duration,
          description: activities || oldPackage.description,
        },
      });
    } catch (error) {
      this._logger.error(`Error in Updating package: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting package with id ${id}`);
      return await this.prismaService.franchisePackages.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this._logger.error(`Error in Deleting package: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
