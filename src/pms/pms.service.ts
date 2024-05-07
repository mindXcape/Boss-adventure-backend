import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePmDto } from './dto/create-pm.dto';
import { UpdatePmDto } from './dto/update-pm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AwsService } from 'src/aws/aws.service';
import { Logger } from '@nestjs/common';
import { CreateBooking, CreateVehicleBooking } from './types/booking';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { paginate } from 'src/utils/paginate';
import { UpdateBookingDto, UpdateVehicleBookingDto } from './dto/create-booking.dto';

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

  async createVehicleBooking(model: any, data: CreateVehicleBooking) {
    try {
      this._logger.log('Creating a new vehicle booking');
      const doesVehicleExist = await model.vehicle.findUnique({
        where: {
          id: data.vehicleId,
        },
      });

      if (!doesVehicleExist) throw new NotFoundException('Vehicle does not exist');

      const doesDriverExist = await model.user.findUnique({
        where: {
          id: data.driverId,
          roles: {
            some: {
              roleId: 'ADMIN',
            },
          },
          designation: 'DRIVER',
        },
      });

      if (!doesDriverExist) throw new NotFoundException('Driver does not exist');

      const booking = await model.vehicleBooking.create({
        data: {
          ...data,
          vehicleId: data.vehicleId,
        },
      });
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
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

  async updateVehicleBooking(id: string, data: UpdateVehicleBookingDto) {
    try {
      this._logger.log(`Updating vehicle booking with id ${id}`);
      const doesBookingExist = await this.prisma.vehicleBooking.findUnique({
        where: {
          id,
        },
      });

      if (!doesBookingExist) throw new NotFoundException('Vehicle booking does not exist');

      const booking = await this.prisma.vehicleBooking.update({
        where: {
          id,
        },
        data,
      });
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findVehicleBooking(id: string) {
    try {
      this._logger.log(`Fetching vehicle booking with id ${id}`);
      const booking = await this.prisma.vehicleBooking.findUnique({
        where: {
          id,
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });

      if (!booking) throw new NotFoundException('Vehicle booking does not exist');
      return booking;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async updateBooking(id: string, data: UpdateBookingDto) {
    try {
      this._logger.log(`Updating booking with id ${id}`);

      const bookingExists = await this.prisma.booking.findUnique({
        where: {
          id,
        },
      });

      if (!bookingExists) throw new NotFoundException('Booking does not exist');

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
        data: {
          status: data.status || bookingExists.status,
          ...(data.date && { date: data.date }),
          ...(data.hotelId && { hotelId: data.hotelId }),
          ...(data.lodgeId && { lodgeId: data.lodgeId }),
          ...(data.meal && { meal: data.meal }),
          ...(data.comment && { comment: data.comment }),
          ...(data.groupId && { groupId: data.groupId }),
        },
      });
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
      if (lodgeId && lodgeId !== '') {
        const lodgeExists = await this.prisma.lodgeBranch.findUnique({
          where: { id: lodgeId },
          select: { id: true, name: true },
        });
        if (!lodgeExists) {
          throw new NotFoundException(`Lodge with ID ${lodgeId} does not exist.`);
        }
      }
      if (hotelId && hotelId !== '') {
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

      const pms: any = await this.prisma.pMS.findUnique({
        where: {
          id,
        },
      });

      if (!pms) throw new NotFoundException('PMS does not exist');

      const result = await this.prisma.$transaction(async prisma => {
        for (const data of activities) {
          const { date, description, hotelId, lodgeId, meal, name, transfer, transferDetails } =
            data;
          const booking = await this.findBookingByGroup({ hotelId, lodgeId, groupId });
          if (!booking) throw new BadRequestException('Booking does not exist');

          if (!hotelId && !lodgeId) {
            throw new NotFoundException('HotelId or LodgeId is required');
          }

          const newBooking = await this.updateBooking(booking.id, {
            date,
            hotelId,
            lodgeId,
            meal,
            groupId,
          });

          if (transfer === 'DRIVE') {
            this._logger.log('Drive transfer');
            if (!transferDetails || !transferDetails.driverId || !transferDetails.vehicleId) {
              throw new BadRequestException(
                'DriverId and VehicleId is required for Drive transfer',
              );
            }

            const vehicleExist = await prisma.vehicle.findFirst({
              where: {
                id: transferDetails.vehicleId,
              },
            });
            if (!vehicleExist) throw new BadRequestException('Vehicle does not exist');

            let vehicle;

            if (!data.vehicleBookingId) {
              this._logger.log('No booking id found, creating a new vehicle booking');
              const driverExits = await prisma.user.findUnique({
                where: {
                  id: transferDetails.driverId,
                  roles: {
                    some: {
                      roleId: 'ADMIN',
                    },
                  },
                  designation: 'DRIVER',
                },
              });
              if (!driverExits) throw new BadRequestException('Driver does not exist');

              vehicle = await prisma.vehicleBooking.create({
                data: {
                  vehicleId: transferDetails.vehicleId,
                  driverId: transferDetails.driverId,
                  date,
                },
              });
            } else {
              const v = await this.findVehicleBooking(data.vehicleBookingId);
              if (!v) throw new BadRequestException('Vehicle booking does not exist');
              this._logger.log('Booking found, updating vehicle booking');
              vehicle = await this.updateVehicleBooking(data.vehicleBookingId, {
                vehicleId: transferDetails.vehicleId,
                driverId: transferDetails.driverId,
                comment: transferDetails.comment,
                status: transferDetails.status,
                date,
              });
            }

            if (!vehicle) throw new BadRequestException('Vehicle booking failed');
            newActivities.activity.push({
              bookingId: newBooking.id,
              description,
              name,
              transfer,
              transferDetails,
              vehicleBookingId: vehicle.id,
            });
            continue;
          }

          if (transfer === 'FLIGHT') {
            if (!transferDetails || !transferDetails.flightNumber) {
              throw new BadRequestException(
                'FlightNumber and Airline is required for Flight transfer',
              );
            }
            // check if previously what was the transfer type and if it was drive then made status as cancelled in the vehicle booking
            const abc = pms.customPackage.activity.map(async activity => {
              if (activity.transfer === 'DRIVE' && activity.vehicleBookingId) {
                this._logger.log("Found previous drive transfer, updating it's status");
                await prisma.vehicleBooking.update({
                  where: { id: activity.vehicleBookingId },
                  data: { status: 'CANCELLED' },
                });
              }
            });
            await Promise.all(abc);
          }

          newActivities.activity.push({
            bookingId: newBooking.id,
            description,
            name,
            transfer,
            transferDetails,
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
            additionalInfo: updatePmDto.additionalInfo || pms.additionalInfo,
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
      const { groupId, activities, additionalInfo } = createPmDto;
      this._logger.log(`Creating a new PMS for group ${groupId}`);

      await this.validateDto(createPmDto);

      const newActivities = {
        activity: [],
      };

      const result = await this.prisma.$transaction(async prisma => {
        for (const data of activities) {
          const { date, description, hotelId, lodgeId, meal, name, transfer, transferDetails } =
            data;
          const booking = await this.createBooking({ date, hotelId, lodgeId, meal, groupId });

          if (transfer === 'DRIVE') {
            if (!transferDetails.driverId || !transferDetails.vehicleId) {
              throw new BadRequestException(
                'DriverId and VehicleNumber is required for Drive transfer',
              );
            }
            const vehicle = await this.createVehicleBooking(prisma, {
              vehicleId: transferDetails.vehicleId,
              driverId: transferDetails.driverId,
              date,
            });
            if (!vehicle) throw new BadRequestException('Vehicle booking failed');
            newActivities.activity.push({
              bookingId: booking.id,
              description,
              name,
              transfer,
              transferDetails,
              vehicleBookingId: vehicle.id,
            });
            continue;
          }

          newActivities.activity.push({
            bookingId: booking.id,
            description,
            name,
            transfer,
            transferDetails,
          });
        }
        const output = await prisma.pMS.create({
          data: {
            groupId,
            leaderId: createPmDto.leaderId,
            guideId: createPmDto.guideId,
            packageId: createPmDto.packageId,
            customPackage: newActivities,
            additionalInfo,
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
        return output;
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
              { hotel: { name: { contains: query.search || '', mode: 'insensitive' } } },
              { lodge: { name: { contains: query.search || '', mode: 'insensitive' } } },
              { hotel: { hotel: { name: { contains: query.search || '', mode: 'insensitive' } } } },
              { lodge: { lodge: { name: { contains: query.search || '', mode: 'insensitive' } } } },
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

  async findAllVehicleBookings(query: QueryPackagesDto) {
    try {
      this._logger.log('Fetching all vehicle bookings');
      const result = await paginate(
        this.prisma.vehicleBooking,
        {
          where: {
            OR: [
              { vehicle: { number: { contains: query.search || '', mode: 'insensitive' } } },
              { driver: { name: { contains: query.search || '', mode: 'insensitive' } } },
            ],
          },
          include: {
            vehicle: true,
            driver: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );

      const rows = result.rows.map(async (booking: any) => {
        return {
          ...booking,
          vehicle: await this.getSignedUrl(booking.vehicle),
          driver: await this.getUserSignedUrl(booking.driver),
        };
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
                      professional: true,
                      roles: true,
                      address: true,
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
        if (activity.transfer && activity.transferDetails) {
          // check if transfer is drive and if drive get vehicle objet and driver object from transferDetails
          if (activity.transfer === 'DRIVE') {
            const { driverId, vehicleNumber } = activity.transferDetails;
            const driver = await this.prisma.user.findUnique({
              where: {
                id: driverId,
                roles: {
                  some: {
                    roleId: {
                      equals: 'ADMIN',
                    },
                  },
                },
                designation: 'DRIVER',
              },
              include: {
                address: true,
                professional: true,
                roles: true,
                bank: {
                  select: {
                    id: true,
                    name: true,
                    class: true,
                  },
                },
              },
            });
            const vehicle = await this.prisma.vehicle.findFirst({
              where: {
                number: vehicleNumber,
              },
            });
            return {
              ...activity,
              booking,
              transferDetails: {
                ...activity.transferDetails,
                driver,
                vehicle,
              },
            };
          }
        }
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
