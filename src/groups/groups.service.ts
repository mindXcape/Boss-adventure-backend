import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

      // fetch all the users and  check if they have the one role of leader and guide
      const userList = await this.prismaService.user.findMany({
        where: {
          id: {
            in: clients.map(client => client.clientId),
          },
        },
        include: {
          roles: true,
        },
      });

      // Validate user IDs
      if (userList.length !== clients.length) {
        throw new BadRequestException('One or more user IDs do not exist');
      }

      // // Group must have one leader and guide
      const leader = userList.filter(user => user.roles.some(role => role.roleId === 'LEADER'));
      const guide = userList.filter(user => user.roles.some(role => role.roleId === 'GUIDE'));
      if (leader.length !== 1 || guide.length !== 1) {
        throw new BadRequestException('Group must have one leader and guide');
      }

      const users = clients.map(client => {
        return {
          ...(client.rooms && { rooms: client.rooms }),
          ...(client.extension && { extension: client.extension }),
          user: {
            connect: {
              id: client.clientId,
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
            select: { user: true, rooms: true, extension: true },
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
                rooms: true,
                extension: true,
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
              rooms: true,
              extension: true,
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

      if (!group) throw new NotFoundException('Group does not exist');

      const users = group.UsersOnGroup.map(async (user: any) => {
        const u = await this.getSignedUrl(user.user);
        return {
          ...user,
          user: u,
        };
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

      // getch all the users and  check if they have the one role of leader and guide
      const userlist = await this.prismaService.user.findMany({
        where: {
          id: {
            in: clients.map(client => client.clientId),
          },
        },
        include: {
          roles: true,
        },
      });

      // Validate user IDs
      if (userlist.length !== clients.length) {
        throw new BadRequestException('One or more user IDs do not exist');
      }

      // Group must have one leader and guide
      const leader = userlist.filter(user => user.roles.some(role => role.roleId === 'LEADER'));
      const guide = userlist.filter(user => user.roles.some(role => role.roleId === 'GUIDE'));
      if (leader.length !== 1 || guide.length !== 1) {
        throw new BadRequestException('Group must have one leader and guide');
      }

      const connectUsers = clients.map(client => ({
        groupId: id,
        userId: client.clientId,
        rooms: client.rooms,
        extension: client.extension,
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
                select: { user: true, extension: true, rooms: true },
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
