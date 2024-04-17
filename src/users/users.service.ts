import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateBankDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/utils/paginate';
import { PaginateQueryDto } from './dto/paginateUser.dto';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class UsersService {
  private readonly _logger = new Logger('User Services');
  constructor(private prisma: PrismaService, private awsService: AwsService) {}

  async create(createUserDto: CreateUserDto) {
    this._logger.log(`Creating new user: ${createUserDto?.email}`);

    const {
      name,
      profileImage,
      email,
      panNumber,
      bankId,
      accountNumber,
      status,
      phone,
      dob,
      address,
      citizenNumber,
      city,
      designation,
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
    try {
      this._logger.log(`Registering new user: ${createUserDto?.email}`);

      const isUnique = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (isUnique) {
        throw new BadRequestException('Email should be unique');
      }

      const user = await this.prisma.user.create({
        data: {
          name,
          profileImage,
          email,
          phone,
          status,
          dob,
          designation,
          accountNumber,
          bankId,
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
              panNumber,
              passportNumber,
              passportExpire,
              citizenNumber,
              guide_license,
              nma,
            },
          },
        },
        include: {
          address: true,
          professional: true,
          roles: true,
          bank: true,
        },
      });

      return {
        ...user,
        profileImage: user.profileImage
          ? await this.awsService.getSignedUrlFromS3(user.profileImage)
          : null,
      };
    } catch (error) {
      await this.awsService.deleteFileFromS3(profileImage);
      this._logger.log(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async getAll(query: PaginateQueryDto) {
    try {
      this._logger.log(`Fetching all users`);
      const users = await this.prisma.user.findMany({
        where: {
          name: {
            contains: query.name || '',
            mode: 'insensitive',
          },
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
        orderBy: {
          name: 'asc',
        },
      });

      const signedUsers = users.map(async (user: any) => {
        return {
          ...user,
          profileImage: user?.profileImage
            ? await this.awsService.getSignedUrlFromS3(user.profileImage)
            : null,
        };
      });

      return await Promise.all(signedUsers);
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: PaginateQueryDto) {
    try {
      this._logger.log(`Fetching all users`);
      const users = await paginate(
        this.prisma.user,
        {
          where: {
            roles: {
              some: {
                roleId: {
                  in: [query.role],
                },
              },
            },
            name: {
              contains: query.name || '',
              mode: 'insensitive',
            },
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
        },
        { perPage: +query.perPage || 10, page: +query.page || 1 },
      );

      const signedUsers = users.rows.map(async (user: any) => {
        return {
          ...user,
          profileImage: user?.profileImage
            ? await this.awsService.getSignedUrlFromS3(user.profileImage)
            : null,
        };
      });

      return {
        ...users,
        rows: await Promise.all(signedUsers),
      };
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      this._logger.log(`Fetching user: ${id}`);

      const user = await this.prisma.user.findUnique({
        where: { id },
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

      return {
        ...user,
        profileImage: user?.profileImage
          ? await this.awsService.getSignedUrlFromS3(user.profileImage)
          : null,
      };
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this._logger.log(`Updating user: ${id}`);
    const {
      name,
      email,
      status,
      phone,
      dob,
      address,
      citizenNumber,
      profileImage,
      designation,
      city,
      state,
      country,
      zipCode,
      companyName,
      passportNumber,
      accountNumber,
      bankId,
      passportExpire,
      guide_license,
      panNumber,
      nma,
      role,
    } = updateUserDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        include: {
          address: true,
          professional: true,
          roles: true,
        },
      });

      if (!user) throw new BadRequestException('User not found');

      if (email) {
        const isValidEmail = await this.prisma.user.findFirst({
          where: { email },
        });

        if (isValidEmail) throw new BadRequestException('Email should be unique');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        include: {
          address: true,
          professional: true,
          bank: true,
          roles: true,
        },
        data: {
          name: name || user.name,
          designation: designation || user.designation,
          email: email || user.email,
          phone: phone || user.phone,
          status: status || user.status,
          dob: dob || user.dob,
          profileImage: profileImage || user.profileImage,
          bankId: bankId || user.bankId,
          accountNumber: accountNumber || user.accountNumber,
          address: {
            update: {
              address: address || user.address.address,
              city: city || user.address.city,
              state: state || user.address.state,
              country: country || user.address.country,
              zipCode: zipCode || user.address.zipCode,
            },
          },
          roles: {
            deleteMany: { userId: id },
            createMany: {
              data: {
                roleId: role || user.roles[0].roleId,
              },
            },
          },
          professional: {
            update: {
              companyName: companyName || user.professional.companyName,
              passportNumber: passportNumber || user.professional.passportNumber,
              passportExpire: passportExpire || user.professional.passportExpire,
              citizenNumber: citizenNumber || user.professional.citizenNumber,
              guide_license: guide_license || user.professional.guide_license,
              nma: nma || user.professional.nma,
              panNumber: panNumber || user.professional.panNumber,
            },
          },
        },
      });

      return {
        ...updatedUser,
        profileImage: updatedUser?.profileImage
          ? await this.awsService.getSignedUrlFromS3(updatedUser.profileImage)
          : null,
      };
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
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

  async createOneBank(userId: string, bank: CreateBankDto): Promise<any> {
    this._logger.log(`Creating new address for user: ${userId}`);

    /*
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new BadRequestException('User not found');
      await this.prisma.bankDetails.create({
        data: {
          userId: userId,
          branch: bank.branch,
          accountNo: bank.accountNo,
          bankName: bank.bankName,
          label: bank.label,
        },
      });

      return await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          address: true,
          professional: true,
          roles: true,
          bankDetails: true,
        },
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
    */
    return null;
  }

  async createManyBank(userId: string, banks: CreateBankDto[]) {
    this._logger.log(`Creating new addresses for user: ${userId}`);
    /*

    try {
      banks.forEach(async bank => {
        await this.createOneBank(userId, bank);
      });

      return await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          address: true,
          professional: true,
          roles: true,
          bankDetails: true,
        },
      });
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
    */
    return null;
  }

  async findOneByEmail(email: string): Promise<any> {
    this._logger.log(`Fetching user by email: ${email} `);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          address: true,
          professional: true,
          roles: true,
          bank: true,
        },
      });
      return {
        ...user,
        profileImage: user.profileImage
          ? await this.awsService.getSignedUrlFromS3(user.profileImage)
          : null,
      };
    } catch (error) {
      this._logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }
}
