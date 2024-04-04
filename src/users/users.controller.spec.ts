import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;

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
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      zipCode: '123456',
      accountNumber: '1234567890',
      address: 'Kathmandu',
      bankId: '1',
      city: 'Kathmandu',
      citizenNumber: `1234567890`,
      companyName: 'Company',
      country: 'Nepal',
      designation: 'ACCOUNT',
      dob: new Date().toDateString(),
      email: 'test@gmail.com',
      name: 'Test User',
      passportExpire: new Date().toDateString(),
      passportNumber: '1234567890',
      phone: '1234567890',
      profileImage: 'image',
      guide_license: '1234567890',
      nma: '1234567890',
      panNumber: '1234567890',
      role: 'ADMIN',
      state: 'State',
      status: 'ACTIVE',
    };
    expect(await controller.create(dto)).toEqual({
      id: 1,
      ...dto,
    });
  });
});
