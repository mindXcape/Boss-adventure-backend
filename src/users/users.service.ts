import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate } from 'src/utils/paginate';
import { PaginateQueryDto } from './dto/paginateUser.dto';
import { CreateBankDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly _logger = new Logger('User Services');
  constructor(private prisma: PrismaService, private awsService: AwsService) {}

  async create(createUserDto: CreateUserDto) {
    this._logger.log(`Creating new user: ${createUserDto?.email}`);

    const {
      name,
      profileImage,
      panNumber,
      gender,
      bankId,
      accountNumber,
      status,
      language,
      category,
      dob,
      address,
      citizenNumber,
      designation,
      role,
      passportNumber,
      passportExpire,
      guideLicense,
      guideLicenseExpire,
      nationalIdNumber,
      asset,
      nma,
      ...rest
    } = createUserDto;
    try {
      this._logger.log(`Registering new user: ${createUserDto?.email}`);

      if (createUserDto?.email) {
        const isUnique = await this.prisma.user.findFirst({
          where: {
            email: createUserDto?.email,
          },
        });

        if (isUnique) {
          throw new BadRequestException('Email should be unique');
        }
      }

      if (bankId) {
        const isValid = await this.prisma.bank.findFirst({
          where: {
            id: bankId,
          },
        });

        if (!isValid) {
          throw new BadRequestException('Invalid bankId provided');
        }
      }

      const user = await this.prisma.user.create({
        data: {
          name,
          profileImage,
          status,
          dob,
          designation,
          accountNumber,
          language,
          category,
          ...(bankId && { bankId }),
          gender,
          address,
          roles: {
            create: {
              roleId: role,
            },
          },
          asset: {
            create: {
              citizenshipImg: asset?.citizenshipImg,
              guideLicenseImg: asset?.guideLicenseImg,
              panCardImg: asset?.panCardImg,
              cvImg: asset?.cvImg,
              namBookImg: asset?.namBookImg,
              nationIdImg: asset?.nationIdImg,
              passportImg: asset?.passportImg,
            },
          },
          professional: {
            create: {
              panNumber,
              passportNumber,
              passportExpire,
              citizenNumber,
              nationalIdNumber,
              guide_license: guideLicense,
              guide_license_Expire: guideLicenseExpire,
              nma,
            },
          },
          ...rest,
        },
        include: {
          professional: true,
          asset: true,
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
          professional: true,
          asset: true,
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
            ...(query.designation && {
              designation: {
                in: [query.designation],
              },
            }),
            OR: [
              {
                name: {
                  contains: query.name || '',
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query.name || '',
                  mode: 'insensitive',
                },
              },
            ],
          },
          include: {
            asset: {
              select: {
                citizenshipImg: true,
                guideLicenseImg: true,
                panCardImg: true,
                cvImg: true,
                namBookImg: true,
                nationIdImg: true,
                passportImg: true,
              },
            },
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
        const { asset } = user;

        if (asset) {
          const newAsset = {};
          const signedAssets = await Promise.all(
            Object.keys(asset).map(async key => {
              if (asset[key]) {
                return {
                  [key]: await this.awsService.getSignedUrlFromS3(asset[key]),
                };
              }
              return {
                [key]: null,
              };
            }),
          );

          signedAssets.forEach((asset: any) => {
            for (const [key, value] of Object.entries(asset)) {
              newAsset[key] = value;
            }
          });

          return {
            ...user,
            asset: newAsset,
            profileImage: user?.profileImage
              ? await this.awsService.getSignedUrlFromS3(user.profileImage)
              : null,
          };
        }
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
          professional: true,
          asset: {
            select: {
              citizenshipImg: true,
              guideLicenseImg: true,
              panCardImg: true,
              cvImg: true,
              namBookImg: true,
              nationIdImg: true,
              passportImg: true,
            },
          },
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

      const { asset } = user;

      if (asset) {
        const newAsset = {};
        const signedAssets = await Promise.all(
          Object.keys(asset).map(async key => {
            if (asset[key]) {
              return {
                [key]: await this.awsService.getSignedUrlFromS3(asset[key]),
              };
            }
            return {
              [key]: null,
            };
          }),
        );

        signedAssets.forEach((asset: any) => {
          for (const [key, value] of Object.entries(asset)) {
            newAsset[key] = value;
          }
        });

        return {
          ...user,
          asset: newAsset,
          profileImage: user?.profileImage
            ? await this.awsService.getSignedUrlFromS3(user.profileImage)
            : null,
        };
      }

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
      language,
      asset,
      dob,
      address,
      citizenNumber,
      profileImage,
      designation,
      gender,
      passportNumber,
      accountNumber,
      bankId,
      passportExpire,
      nationalIdNumber,
      guideLicense,
      guideLicenseExpire,
      panNumber,
      remark,
      nma,
      role,
    } = updateUserDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        include: {
          asset: true,
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
          professional: true,
          asset: true,
          bank: true,
          roles: true,
        },
        data: {
          name: name || user.name,
          remark: remark || user.remark,
          designation: designation || user.designation,
          email: email || user.email,
          phone: phone || user.phone,
          status: status || user.status,
          dob: dob || user.dob,
          profileImage: profileImage || user.profileImage,
          bankId: bankId || user.bankId,
          accountNumber: accountNumber || user.accountNumber,
          gender: gender || user.gender,
          language: language || user.language,
          address: address || user.address,
          roles: {
            deleteMany: { userId: id },
            createMany: {
              data: {
                roleId: role || user.roles[0].roleId,
              },
            },
          },
          asset: {
            update: {
              citizenshipImg: asset?.citizenshipImg || user.asset.citizenshipImg,
              guideLicenseImg: asset?.guideLicenseImg || user.asset.guideLicenseImg,
              panCardImg: asset?.panCardImg || user.asset.panCardImg,
              cvImg: asset?.cvImg || user.asset.cvImg,
              namBookImg: asset?.namBookImg || user.asset.namBookImg,
              nationIdImg: asset?.nationIdImg || user.asset.nationIdImg,
              passportImg: asset?.passportImg || user.asset.passportImg,
            },
          },
          professional: {
            update: {
              passportNumber: passportNumber || user.professional.passportNumber,
              passportExpire: passportExpire || user.professional.passportExpire,
              citizenNumber: citizenNumber || user.professional.citizenNumber,
              guide_license: guideLicense || user.professional.guide_license,
              nationalIdNumber: user.professional.nationalIdNumber || nationalIdNumber,
              guide_license_Expire: guideLicenseExpire || user.professional.guide_license_Expire,
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
      const user = await this.prisma.user.findFirst({
        where: { email },
        include: {
          asset: true,
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
