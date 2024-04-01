import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { AwsService } from 'src/aws/aws.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService', () => {
  let service: UsersService;

  const mockUserService = {
    create: jest.fn(dto => {
      return {
        id: 1,
        ...dto,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, AwsService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
