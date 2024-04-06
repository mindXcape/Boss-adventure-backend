import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateLodgeBranchDto, CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeBranchDto, UpdateLodgeDto } from './dto/update-lodge.dto';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLodgeDto } from './dto/query-lodge.dto';
import { paginate } from 'src/utils/paginate';

@Injectable()
export class LodgesService {
  private readonly _logger = new Logger('lodge Services');
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

  async create(createLodgeDto: CreateLodgeDto) {
    const { branches, lodgeName, image } = createLodgeDto;
    try {
      this._logger.log(`Creating new Lodge: ${lodgeName}`);
      let lodgeId = '';
      await this.prismaService.$transaction(async tx => {
        const lodge = await tx.lodge.create({
          data: {
            name: lodgeName,
            image,
          },
        });

        for (const branch of branches) {
          const { branchName, ...rest } = branch;
          await tx.lodgeBranch.create({
            data: {
              name: branchName,
              lodgeId: lodge.id,
              ...rest,
            },
          });
        }
        lodgeId = lodge.id;
      });

      const lodge = await this.prismaService.lodge.findUnique({
        where: { id: lodgeId },
        include: { branch: true },
      });

      return await this.getSignedUrl(lodge);
    } catch (error) {
      this._logger.error(`Error while creating lodge: ${error}`);
      //  await this.awsService.deleteFileFromS3(image);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      this._logger.log(`Fetching all loges`);
      const lodges = await this.prismaService.lodge.findMany({
        include: {
          branch: true,
        },
      });
      const result = await this.getSignedUrl(lodges);

      return await Promise.all(result);
    } catch (error) {
      this._logger.error(`Error while fetching all loges: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching lodge with id: ${id}`);
      const lodge = await this.prismaService.lodge.findUnique({
        where: { id },
        include: {
          branch: true,
        },
      });
      if (!lodge) {
        throw new BadRequestException('Lodge does not exist');
      }
      const result = await this.getSignedUrl(lodge);

      return result;
    } catch (error) {
      this._logger.error(`Error while fetching lodge: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateLodgeDto: UpdateLodgeDto) {
    try {
      const lodge = await this.prismaService.lodge.findUnique({ where: { id } });
      if (!lodge) {
        throw new BadRequestException('lodge does not exist');
      }
      const updatedLodge = await this.prismaService.lodge.update({
        where: { id },
        data: {
          name: updateLodgeDto.lodgeName || lodge.name,
          image: updateLodgeDto.image || lodge.image,
        },
        include: { branch: true },
      });
      const results = await this.getSignedUrl(updatedLodge);

      return results;
    } catch (error) {
      this._logger.error(`Error while updating lodge: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async updateBranch(branchId: string, updateBranchDto: UpdateLodgeBranchDto) {
    const { branchName, ...rest } = updateBranchDto;
    try {
      const branch = await this.prismaService.lodgeBranch.findUnique({ where: { id: branchId } });
      if (!branch) {
        throw new BadRequestException('Branch does not exist');
      }

      this._logger.log(`Updating lodge branch of id ${branchId}`);
      const updatedBranch = await this.prismaService.lodgeBranch.update({
        where: { id: branchId },
        data: {
          name: branchName || branch.name,
          ...rest,
        },
        include: {
          lodge: true,
        },
      });

      const lodge = await this.getSignedUrl(updatedBranch.lodge);

      return {
        ...updatedBranch,
        lodge,
      };
    } catch (error) {
      this._logger.error(`Error while updating branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async getAllBranches(query: QueryLodgeDto) {
    try {
      this._logger.log(`Fetching all lodges branches`);
      const branches = await paginate(
        this.prismaService.lodgeBranch,
        {
          where: {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { address: { contains: query.search, mode: 'insensitive' } },
              { lodge: { name: { contains: query.search, mode: 'insensitive' } } },
            ],
          },
          include: { lodge: true },
        },
        {
          perPage: +query.perPage || 10,
          page: +query.page || 1,
        },
      );
      const result = branches.rows.map(async (branch: any) => {
        const lodge = await this.getSignedUrl(branch.lodge);
        return {
          ...branch,
          lodge,
        };
      });
      return {
        ...branches,
        rows: await Promise.all(result),
      };
    } catch (error) {
      this._logger.error(`Error while fetching all lodge branches: ${error}`);
      throw new BadRequestException(error.message);
    }
  }
  async getBranch(branchId: string) {
    try {
      this._logger.log(`Fetching lodge branch with id: ${branchId}`);
      const branch = await this.prismaService.lodgeBranch.findUnique({
        where: { id: branchId },
        include: { lodge: true },
      });
      if (!branch) {
        throw new BadRequestException('Branch does not exist');
      }
      const lodge = await this.getSignedUrl(branch.lodge);

      return {
        ...branch,
        lodge,
      };
    } catch (error) {
      this._logger.error(`Error while fetching branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async addNewBranch(lodgeId: string, createLodgeBranchDto: CreateLodgeBranchDto) {
    try {
      const lodge = await this.prismaService.lodge.findUnique({ where: { id: lodgeId } });
      if (!lodge) {
        throw new BadRequestException(`Lodge does not exist with id: ${lodgeId}`);
      }

      const { branchName, ...branch } = createLodgeBranchDto;
      const newBranch = await this.prismaService.lodgeBranch.create({
        data: {
          name: branchName,
          lodgeId,
          ...branch,
        },
        include: {
          lodge: true,
        },
      });
      const signedLodge = await this.getSignedUrl(newBranch.lodge);
      return {
        ...newBranch,
        lodge: signedLodge,
      };
    } catch (error) {
      this._logger.error(`Error while adding new branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async removeBranch(branchId: string) {
    try {
      this._logger.log(`Deleting lodge branch with id: ${branchId}`);
      const branch = await this.prismaService.lodgeBranch.findUnique({ where: { id: branchId } });
      if (!branch) {
        throw new BadRequestException('Lodge branch does not exist');
      }
      const deletedBranch = await this.prismaService.lodgeBranch.delete({
        where: { id: branchId },
      });
      return deletedBranch;
    } catch (error) {
      this._logger.error(`Error while deleting branch: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async removeBranches(lodgeId: string) {
    try {
      this._logger.log(`Deleting all branches of lodge with id: ${lodgeId}`);
      const doesLodgeExist = await this.prismaService.lodge.findUnique({ where: { id: lodgeId } });
      if (!doesLodgeExist) {
        throw new BadRequestException('lodge does not exist');
      }
      await this.prismaService.lodgeBranch.deleteMany({ where: { lodgeId } });
      return await this.prismaService.lodge.findUnique({
        where: { id: lodgeId },
        include: { branch: true },
      });
    } catch (error) {
      this._logger.error(`Error while deleting all branches: ${error}`);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting lodge with id: ${id}`);
      const doesLodgeExist = await this.prismaService.lodge.findUnique({ where: { id } });
      if (!doesLodgeExist) {
        throw new BadRequestException('lodge does not exist');
      }
      const lodge = await this.prismaService.lodge.delete({ where: { id } });

      if (lodge.image) {
        await this.awsService.deleteFileFromS3(lodge.image);
      }

      return lodge;
    } catch (error) {
      this._logger.error(`Error while deleting lodge: ${error}`);
      throw new BadRequestException(error.message);
    }
  }
}
