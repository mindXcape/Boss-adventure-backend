import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  private async getUserSignedUrl(items: any[] | any) {
    if (Array.isArray(items)) {
      return await Promise.all(
        items.map(async item => {
          if (item.profileImage === null) return item;
          const url = await this.awsService.getSignedUrlFromS3(item.profileImage);
          return { ...item, profileImage: url };
        }),
      );
    }
    if (items.profileImage === null) return items;
    const url = await this.awsService.getSignedUrlFromS3(items.profileImage);
    return { ...items, profileImage: url };
  }

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

  async createBooking(data: CreateBooking) {
    try {
      this._logger.log('Creating a new booking');
      if (!data.hotelId && !data.lodgeId) {
        throw new BadRequestException('HotelId or LodgeId is required');
      }
      if (data.hotelId && data.lodgeId) {
        throw new BadRequestException('Only one of HotelId or LodgeId should be provided');
      }
      if (data.hotelId && data.lodgeId) {
        throw new NotFoundException('Only one of HotelId or LodgeId should be provided');
      }

      if (data.hotelId) {
        const hotelExists = await this.prisma.hotelBranch.findUnique({
          where: { id: data.hotelId },
          select: { id: true, name: true },
        });

        if (!hotelExists) {
          throw new NotFoundException(`Hotel with ID ${data.hotelId} does not exist.`);
        }
      }
      if (data.lodgeId) {
        const lodgeExists = await this.prisma.lodgeBranch.findUnique({
          where: { id: data.lodgeId },
          select: { id: true, name: true },
        });
        if (!lodgeExists) {
          throw new NotFoundException(`Lodge with ID ${data.lodgeId} does not exist.`);
        }
      }

      const booking = await this.prisma.booking.create({
        data,
      });
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async updateBooking(id: string, data: CreateBooking) {
    try {
      this._logger.log(`Updating booking with id ${id}`);
      if (!data.hotelId && !data.lodgeId) {
        throw new NotFoundException('HotelId or LodgeId is required');
      }
      if (data.hotelId && data.lodgeId) {
        throw new NotFoundException('Only one of HotelId or LodgeId should be provided');
      }
      if (data.hotelId) {
        const hotelExists = await this.prisma.hotelBranch.findUnique({
          where: { id: data.hotelId },
          select: { id: true, name: true },
        });
        if (!hotelExists) {
          throw new NotFoundException(`Hotel with ID ${data.hotelId} does not exist.`);
        }
      }
      if (data.lodgeId) {
        const lodgeExists = await this.prisma.lodgeBranch.findUnique({
          where: { id: data.lodgeId },
          select: { id: true, name: true },
        });
        if (!lodgeExists) {
          throw new NotFoundException(`Lodge with ID ${data.lodgeId} does not exist.`);
        }
      }
      const booking = await this.prisma.booking.update({
        where: {
          id,
        },
        data,
      });
      console.log('updated Booking: ', booking);
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findBookingByGroup(payload: { groupId: string; lodgeId?: string; hotelId?: string }) {
    try {
      const { lodgeId, hotelId } = payload;
      this._logger.log('Fetching booking');
      // check if hotel or lodge is valid
      if (lodgeId) {
        const lodgeExists = await this.prisma.lodgeBranch.findUnique({
          where: { id: lodgeId },
          select: { id: true, name: true },
        });
        if (!lodgeExists) {
          throw new NotFoundException(`Lodge with ID ${lodgeId} does not exist.`);
        }
      }
      if (hotelId) {
        const hotelExists = await this.prisma.hotelBranch.findUnique({
          where: { id: hotelId },
          select: { id: true, name: true },
        });
        if (!hotelExists) {
          throw new NotFoundException(`Hotel with ID ${hotelId} does not exist.`);
        }
      }
      const booking = await this.prisma.booking.findFirst({
        where: {
          groupId: payload.groupId,
          ...(lodgeId && { lodgeId: payload.lodgeId }),
          ...(hotelId && { hotelId: payload.hotelId }),
        },
      });
      if (!booking) throw new NotFoundException('Booking does not exist');
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findBooking(id: string) {
    try {
      this._logger.log(`Fetching booking with id ${id}`);
      const booking = await this.prisma.booking.findUnique({
        where: {
          id,
        },
        include: {
          lodge: {
            include: {
              lodge: { select: { name: true, image: true } },
            },
          },
          hotel: {
            include: {
              hotel: { select: { name: true, image: true } },
            },
          },
        },
      });

      if (!booking) throw new NotFoundException('Booking does not exist');

      // If hotel is null, then it is a lodge
      // so we get the signed url of the lodge
      if (booking.hotel === null && booking.lodge !== null) {
        const signedLodge = await this.getSignedUrl(booking.lodge.lodge);
        return { ...booking, lodge: { ...booking.lodge, lodge: signedLodge } };
      }

      const signedHotel = await this.getSignedUrl(booking.hotel.hotel);
      return { ...booking, hotel: { ...booking.hotel, hotel: signedHotel } };
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async validateDto(data: UpdatePmDto) {
    const { groupId } = data;

    if (!groupId) throw new BadRequestException('groupId is required');

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
    if (data.leaderId) {
      const leaderExist = group.UsersOnGroup.find(
        user =>
          user.userId === data.leaderId && user.user.roles.some(role => role.roleId === 'LEADER'),
      );
      if (!leaderExist)
        throw new BadRequestException(
          'Leader not found in group or does not have correct role (Leader)',
        );
    }
    if (data.guideId) {
      const guideExist = group.UsersOnGroup.find(
        user =>
          user.userId === data.guideId && user.user.roles.some(role => role.roleId === 'GUIDE'),
      );
      if (!guideExist)
        throw new BadRequestException(
          'Guide not found in group or does not have correct role (Guide)',
        );
    }
    if (!data.packageId) {
      const packageExit = await this.prisma.franchisePackages.findFirst({
        where: {
          id: data.packageId,
        },
      });

      if (!packageExit) throw new BadRequestException('Invalid packageId provided');
    }
    return true;
  }

  async update(id: string, updatePmDto: UpdatePmDto) {
    try {
      this._logger.log(`Updating PMS with id ${id}`);

      await this.validateDto(updatePmDto);

      const { activities, groupId } = updatePmDto;
      if (!activities) throw new BadRequestException('Activities is required');

      const newActivities = {
        activity: [],
      };

      const pms = await this.prisma.pMS.findUnique({
        where: {
          id,
        },
      });

      if (!pms) throw new NotFoundException('PMS does not exist');

      const result = await this.prisma.$transaction(async prisma => {
        for (const data of activities) {
          const { date, description, hotelId, lodgeId, meal, name } = data;
          const booking = await this.findBookingByGroup({ hotelId, lodgeId, groupId });
          if (!booking) throw new BadRequestException('Booking does not exist');

          const newBooking = await this.updateBooking(booking.id, {
            date,
            hotelId,
            lodgeId,
            meal,
            groupId,
          });

          newActivities.activity.push({
            bookingId: newBooking.id,
            description,
            name,
          });
        }
        return await prisma.pMS.update({
          where: { id },
          data: {
            groupId,
            leaderId: updatePmDto.leaderId || pms.leaderId,
            guideId: updatePmDto.guideId || pms.guideId,
            packageId: updatePmDto.packageId || pms.packageId,
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
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async create(createPmDto: CreatePmDto) {
    try {
      const { groupId, activities } = createPmDto;
      this._logger.log(`Creating a new PMS for group ${groupId}`);

      await this.validateDto(createPmDto);

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
      this._logger.error(error.message);
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
            lodge: {
              include: {
                lodge: { select: { name: true, image: true } },
              },
            },
            hotel: {
              include: {
                hotel: { select: { name: true, image: true } },
              },
            },
          },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );

      const rows = result.rows.map(async (booking: any) => {
        if (booking.hotel === null && booking.lodge !== null) {
          const signedLodge = await this.getSignedUrl(booking.lodge.lodge);
          return { ...booking, lodge: { ...booking.lodge, lodge: signedLodge } };
        } else {
          const signedHotel = await this.getSignedUrl(booking.hotel.hotel);
          return { ...booking, hotel: { ...booking.hotel, hotel: signedHotel } };
        }
      });

      return { ...result, rows: await Promise.all(rows) };
    } catch (error) {
      this._logger.error(error.message);
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
              { package: { name: { contains: query.search || '', mode: 'insensitive' } } },
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
                profileImage: true,
              },
            },
            guide: {
              select: {
                roles: true,
                name: true,
                profileImage: true,
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
        const signedLeader = await this.getUserSignedUrl(item.leader);
        const signedGuide = await this.getUserSignedUrl(item.guide);
        const activities = item.customPackage.activity.map(async (activity: any) => {
          const booking = await this.findBooking(activity.bookingId);
          return {
            ...activity,
            booking,
          };
        });
        return {
          ...item,
          guide: signedGuide,
          leader: signedLeader,
          customPackage: await Promise.all(activities),
        };
      });
      return { ...result, rows: await Promise.all(rows) };
    } catch (error) {
      this._logger.error(error.message);
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
          },
          leader: true,
          guide: true,
          package: true,
        },
      });

      if (!pms) throw new NotFoundException('PMS does not exist');

      const signedLeader = await this.getUserSignedUrl(pms.leader);
      const signedGuide = await this.getUserSignedUrl(pms.guide);
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
        guide: signedGuide,
        leader: signedLeader,
      };
    } catch (error) {
      this._logger.error(error.message);
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
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
