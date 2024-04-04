import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateLodgeDto } from './dto/create-lodge.dto';
import { UpdateLodgeDto } from './dto/update-lodge.dto';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LodgesService {
  private readonly _logger = new Logger('Hotel Services');
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private async getSignedUrl(items: any[] | any) {
    if (Array.isArray(items)) {
      return await Promise.all(
        items.map(async item => {
          const url = await this.awsService.getSignedUrlFromS3(item.image);
          return { ...item, image: url };
        }),
      );
    }
    const url = await this.awsService.getSignedUrlFromS3(items.image);
    return { ...items, image: url };
  }

  async create(createLodgeDto: CreateLodgeDto) {
    const { branches, lodgeName } = createLodgeDto;
    try {
      this._logger.log(`Creating new Lodge: ${lodgeName}`);
      let lodgeId = '';
      await this.prismaService.$transaction(async tx => {
        const lodge = await tx.lodge.create({
          data: {
            name: lodgeName,
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

      return {
        ...lodge,
        branch: await this.getSignedUrl(lodge.branch),
      };
    } catch (error) {
      this._logger.error(`Error while creating hotel: ${error}`);
      for (const branch of branches) {
        if (branch.image) {
          await this.awsService.deleteFileFromS3(branch.image);
        }
      }
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all lodges`;
  }

  findOne(id: string) {
    return `This action returns a #${id} lodge`;
  }

  update(id: string, updateLodgeDto: UpdateLodgeDto) {
    return `This action updates a #${id} lodge`;
  }

  remove(id: string) {
    return `This action removes a #${id} lodge`;
  }
}
