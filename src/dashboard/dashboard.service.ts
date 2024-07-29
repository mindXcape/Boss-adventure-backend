import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { QueryDashboardDto } from './dto/create-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly _logger = new Logger('Dashboard Services');
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: QueryDashboardDto) {
    try {
      this._logger.log(`Fetching bookings`);
      const { startDate, endDate } = query;
      const bookings = await this.prismaService.booking.findMany({
        where: {
          date: {
            gte: new Date(startDate), // greater than start date
            lte: new Date(endDate), // less then end date
          },
        },
        include: {
          group: {
            select: {
              groupId: true,
              _count: {
                select: {
                  UsersOnGroup: true,
                },
              },
            },
          },
        },
      });

      const vehicleBookings = await this.prismaService.vehicleBooking.findMany({
        where: {
          date: {
            gte: new Date(startDate), // greater than start date
            lte: new Date(endDate), // less then end date
          },
        },
        include: {
          vehicle: {
            select: {
              number: true,
              model: true,
            },
          },
        },
      });

      const result = await this.getCustomPackages(startDate);

      return {
        bookings: bookings,
        vehicleBookings: vehicleBookings,
        activities: result,
      };
    } catch (error) {
      this._logger.error(`Error fetching bookings: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  async getCustomPackages(date: string) {
    const formattedDate = new Date(date).toISOString();

    return await this.prismaService.$queryRaw`
    SELECT p.id, "groupId", jsonb_agg(activity) AS activities
      FROM "pms" p,
      jsonb_array_elements(p."customPackage"->'activity') AS activity
      WHERE (activity->>'date')::timestamp >= ${formattedDate}::timestamp
      GROUP BY p.id;
    `;
  }
}
