import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/utils/paginate';
import { PaginateQueryDto } from './dto/paginateUser.dto';

@Injectable()
export class UsersService {
  private readonly _logger = new Logger('User Services');
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    this._logger.log(`Creating new user: ${createUserDto?.email}`);
    const {
      name,
      email,
      status,
      phone,
      dob,
      address,
      citizenNumber,
      city,
      state,
      country,
      zipCode,
      role,
      companyName,
      passportNumber,
      passportExpire,
      guide_license,
      nma,
    } = createUserDto;
    this._logger.log(`Registering new user: ${createUserDto?.email}`);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        status,
        dob,
        address: {
          create: {
            address,
            city,
            state,
            country,
            zipCode,
          },
        },
        roles: {
          create: {
            roleId: role,
          },
        },
        professional: {
          create: {
            companyName,
            passportNumber,
            passportExpire,
            citizenNumber,
            guide_license,
            nma,
          },
        },
      },
    });

    return user;
  }

  async findAll(query: PaginateQueryDto) {
    try {
      this._logger.log(`Fetching all users`);
      const users = await paginate(
        this.prisma.user,
        {
          where: {
            name: {
              contains: query.name || '',
              mode: 'insensitive',
            },
          },
        },
        { perPage: +query.perPage || 10, page: +query.page || 1 },
      );

      return users;
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  findOne(id: string) {
    try {
      this._logger.log(`Fetching user: ${id}`);

      return this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    this._logger.log(`Updating user: ${id}`);
    // try {
    //   return this.prisma.user.update({
    //     where: { id },
    //     data: {
    //       ...updateUserDto,
    //     },
    //   });
    // } catch (error) {
    //   this._logger.error(error.message, error.stack);
    //   throw new BadRequestException(error.message);
    // }
    return null;
  }

  remove(id: string) {
    this._logger.log(`Removing user: ${id}`);
    try {
      return this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findOneByEmail(email: string): Promise<any> {
    this._logger.log(`Fetching user by email: ${email} `);
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }
}
