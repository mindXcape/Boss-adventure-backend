import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePmDto } from './dto/create-pm.dto';
import { UpdatePmDto } from './dto/update-pm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';
import { Logger } from '@nestjs/common';
import { CreateBooking } from './types/booking';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { paginate } from 'src/utils/paginate';

@Injectable()
export class PmsService {
  private readonly _logger = new Logger('PMS Service');
  constructor(private prisma: PrismaService, private awsService: AwsService) {}

  async createBooking(data: CreateBooking) {
    try {
      this._logger.log('Creating a new booking');
      if (!data.hotelId && !data.lodgeId) {
        throw new Error('HotelId or LodgeId is required');
      }
      if (data.hotelId && data.lodgeId) {
        throw new Error('Only one of HotelId or LodgeId should be provided');
      }

      if (data.hotelId) {
        const hotelExists = await this.prisma.hotelBranch.findUnique({
          where: { id: data.hotelId },
          select: { id: true, name: true },
        });

        if (!hotelExists) {
          throw new Error(`Hotel with ID ${data.hotelId} does not exist.`);
        }
      }
      if (data.lodgeId) {
        const lodgeExists = await this.prisma.lodgeBranch.findUnique({
          where: { id: data.lodgeId },
          select: { id: true, name: true },
        });
        if (!lodgeExists) {
          throw new Error(`Lodge with ID ${data.lodgeId} does not exist.`);
        }
      }

      const booking = await this.prisma.booking.create({
        data,
      });
      return booking;
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findBooking(id: string) {
    try {
      this._logger.log(`Fetching booking with id ${id}`);
      return await this.prisma.booking.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async create(createPmDto: CreatePmDto) {
    try {
      const { groupId, activities } = createPmDto;
      const group = await this.prisma.group.findFirst({
        where: {
          groupId,
        },
        include: {
          UsersOnGroup: {
            include: {
              user: {
                include: {
                  roles: true,
                },
              },
            },
          },
        },
      });
      if (!group) throw new BadRequestException('Invalid groupId provided');

      // Check leader and guide exist in group or not and have correct roles
      const leaderExist = group.UsersOnGroup.find(
        user =>
          user.userId === createPmDto.leaderId &&
          user.user.roles.some(role => role.roleId === 'LEADER'),
      );
      if (!leaderExist)
        throw new BadRequestException('Leader not found in group or does not have correct role');
      const guideExist = group.UsersOnGroup.find(
        user =>
          user.userId === createPmDto.guideId &&
          user.user.roles.some(role => role.roleId === 'GUIDE'),
      );
      if (!guideExist)
        throw new BadRequestException('Guide not found in group or does not have correct role');

      const packageExit = await this.prisma.franchisePackages.findFirst({
        where: {
          id: createPmDto.packageId,
        },
      });

      if (!packageExit) throw new BadRequestException('Invalid packageId provided');

      const newActivities = {
        activity: [],
      };
      const result = await this.prisma.$transaction(async prisma => {
        for (const data of activities) {
          const { date, description, hotelId, lodgeId, meal, name } = data;
          const booking = await this.createBooking({ date, hotelId, lodgeId, meal, groupId });

          newActivities.activity.push({
            bookingId: booking.id,
            description,
            name,
          });
        }
        return await prisma.pMS.create({
          data: {
            groupId,
            leaderId: createPmDto.leaderId,
            guideId: createPmDto.guideId,
            packageId: createPmDto.packageId,
            customPackage: newActivities,
          },
          include: {
            group: {
              select: {
                groupId: true,
              },
            },
            leader: {
              select: {
                roles: true,
                name: true,
                id: true,
              },
            },
            guide: {
              select: {
                roles: true,
                name: true,
                id: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return result;
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findAllBookings(query: QueryPackagesDto) {
    try {
      this._logger.log('Fetching all bookings');
      const result = await paginate(
        this.prisma.booking,
        {
          where: {
            OR: [
              { hotelId: { contains: query.search || '', mode: 'insensitive' } },
              { lodgeId: { contains: query.search || '', mode: 'insensitive' } },
              { group: { groupId: { contains: query.search || '', mode: 'insensitive' } } },
            ],
          },

          include: {
            group: true,
          },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );
      return result;
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: QueryPackagesDto) {
    try {
      this._logger.log('Fetching all pms');
      const result = await paginate(
        this.prisma.pMS,
        {
          where: {
            OR: [
              { group: { groupId: { contains: query.search || '', mode: 'insensitive' } } },
              { leader: { name: { contains: query.search || '', mode: 'insensitive' } } },
            ],
          },
          include: {
            group: {
              select: {
                groupId: true,
              },
            },
            leader: {
              select: {
                roles: true,
                name: true,
                id: true,
              },
            },
            guide: {
              select: {
                roles: true,
                name: true,
                id: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );
      const rows = result.rows.map(async (item: any) => {
        const activities = item.customPackage.activity.map(async (activity: any) => {
          const booking = await this.findBooking(activity.bookingId);
          return {
            ...activity,
            booking,
          };
        });
        return {
          ...item,
          customPackage: await Promise.all(activities),
        };
      });
      return { ...result, rows: await Promise.all(rows) };
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching PMS with id ${id}`);
      const pms: any = await this.prisma.pMS.findUnique({
        where: {
          id,
        },
        include: {
          group: {
            select: {
              groupId: true,
            },
          },
          leader: {
            select: {
              roles: true,
              name: true,
              id: true,
            },
          },
          guide: {
            select: {
              roles: true,
              name: true,
              id: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const activities = pms.customPackage?.activity.map(async (activity: any) => {
        const booking = await this.findBooking(activity.bookingId);
        return {
          ...activity,
          booking,
        };
      });
      return {
        ...pms,
        customPackage: await Promise.all(activities),
      };
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePmDto: UpdatePmDto) {
    try {
      this._logger.log(`Updating PMS with id ${id}`);
      return { message: 'not implemented' };
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting PMS with id ${id}`);
      const doesExit = await this.prisma.pMS.findUnique({
        where: {
          id,
        },
      });
      if (!doesExit) throw new BadRequestException('PMS does not exist');
      return await this.prisma.pMS.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
