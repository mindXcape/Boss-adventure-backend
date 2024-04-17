import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/utils/paginate';
import { QueryPackagesDto } from 'src/packages/dto/query-package.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class GroupsService {
  private readonly _logger = new Logger('Group Services');
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  private async getSignedUrl(items: any[] | any) {
    if (Array.isArray(items)) {
      return await Promise.all(
        items.map(async (item: any) => {
          if (item.user.profileImage === null) return item;
          const url = await this.awsService.getSignedUrlFromS3(item.user.profileImage);
          return { ...item, user: { ...item.user, profileImage: url } };
        }),
      );
    }
    if (items.profileImage === null) return items;
    const url = await this.awsService.getSignedUrlFromS3(items.profileImage);
    return { ...items, profileImage: url };
  }

  async create(createGroupDto: CreateGroupDto) {
    try {
      const { clients, groupId } = createGroupDto;
      this._logger.log('Creating a new group');

      const doesGroupExist = await this.prismaService.group.findUnique({
        where: {
          groupId,
        },
      });
      if (doesGroupExist) {
        throw new BadRequestException('Group Id should be unique');
      }
      // Validate user IDs
      const allUsersExist =
        (await this.prismaService.user.count({
          where: {
            id: {
              in: clients,
            },
          },
        })) === clients.length;

      if (!allUsersExist) {
        throw new BadRequestException('One or more user IDs do not exist');
      }
      const users = clients.map(clientId => {
        return {
          user: {
            connect: {
              id: clientId,
            },
          },
        };
      });

      const group = await this.prismaService.group.create({
        data: {
          groupId,
          UsersOnGroup: {
            create: users,
          },
        },
        include: {
          UsersOnGroup: {
            select: { user: true },
          },
        },
      });

      return group;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: QueryPackagesDto) {
    try {
      this._logger.log('Getting all groups');
      const allGroups = await paginate(
        this.prismaService.group,
        {
          where: {
            groupId: {
              contains: query.search || '',
              mode: 'insensitive',
            },
          },

          include: {
            UsersOnGroup: {
              select: {
                user: {
                  include: {
                    roles: true,
                  },
                },
              },
            },
          },
        },
        {
          page: query.page || 1,
          perPage: query.perPage || 10,
        },
      );
      const newRows = allGroups.rows.map(async (group: any) => {
        const user = await this.getSignedUrl(group.UsersOnGroup);
        return {
          ...group,
          UsersOnGroup: user,
        };
      });
      return {
        ...allGroups,
        rows: await Promise.all(newRows),
      };
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
  async validateOne(id: string) {
    try {
      this._logger.log(`Validating group with id ${id}`);
      const group = await this.prismaService.group.findUnique({
        where: {
          groupId: id,
        },
      });
      return !group ? { unique: true } : { unique: false };
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Getting group with id ${id}`);
      const group = await this.prismaService.group.findUnique({
        where: {
          id,
        },
        include: {
          UsersOnGroup: {
            select: {
              user: {
                include: {
                  roles: true,
                  address: true,
                  professional: true,
                },
              },
            },
          },
        },
      });

      const users = group.UsersOnGroup.map(async (user: any) => {
        const u = await this.getSignedUrl(user.user);
        return u;
      });

      return { ...group, UsersOnGroup: await Promise.all(users) };
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      this._logger.log(`Updating group with id ${id}`);
      const { clients, groupId } = updateGroupDto;

      const group = await this.prismaService.group.findUnique({
        where: {
          id,
        },
        include: {
          UsersOnGroup: {
            select: { user: true },
          },
        },
      });
      if (!group) {
        throw new BadRequestException('Group does not exist');
      }

      if (group.groupId !== groupId) {
        const doesGroupExist = await this.prismaService.group.findUnique({
          where: {
            groupId,
          },
        });

        if (doesGroupExist) {
          throw new BadRequestException('Group Id should be unique');
        }
      }

      // Validate user IDs
      const allUsersExist =
        (await this.prismaService.user.count({
          where: {
            id: {
              in: clients,
            },
          },
        })) === clients.length;

      if (!allUsersExist) {
        throw new BadRequestException('One or more user IDs do not exist');
      }

      const connectUsers = clients.map(clientId => ({
        groupId: id,
        userId: clientId,
      }));
      let updatedGroup;
      if (clients && clients.length > 0) {
        updatedGroup = await this.prismaService.$transaction(async prisma => {
          await prisma.usersOnGroup.deleteMany({
            where: { groupId: id },
          });

          await prisma.usersOnGroup.createMany({
            data: connectUsers,
          });
          return await prisma.group.update({
            where: { id },
            data: {
              groupId,
            },
            include: {
              UsersOnGroup: {
                select: { user: true },
              },
            },
          });
        });
      }

      return updatedGroup;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      this._logger.log(`Deleting group with id ${id}`);
      const doesGroupExist = await this.prismaService.group.findUnique({
        where: {
          id,
        },
      });
      if (!doesGroupExist) {
        throw new BadRequestException('Group does not exist');
      }
      const group = await this.prismaService.group.delete({
        where: {
          id,
        },
      });
      return group;
    } catch (error) {
      this._logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
