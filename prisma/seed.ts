import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

enum ROLE {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const users = [
  {
    name: 'Dipesh kumar sah',
    roles: [ROLE.ADMIN],
    email: 'dipesh@mailinator.com',
  },
  {
    name: 'Subhashish Jung Shah',
    roles: [ROLE.ADMIN],
    email: 'subhashish@mailinator.com',
  },
  {
    name: 'bus-adventures',
    roles: [ROLE.ADMIN],
    email: 'bus-adventuresh@mailinator.com',
  },
  {
    name: 'Staff bus-adventures',
    roles: [ROLE.USER],
    email: 'staff-bus-adventures@mailinator.com',
  },
];

const loadAdmin = async () => {
  for await (const user of users) {
    await prisma.admin.create({
      data: {
        ...user,
      },
    });
  }

  console.log('Users seed data loaded');
};

const loadUsers = async () => {
  const fakerUser = (): Prisma.UserCreateInput => {
    return {
      name: faker.person.firstName(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      companyName: faker.company.name(),
      email: faker.internet.email(),
      occupation: faker.person.jobType(),
      zipCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']),
      profileImage: faker.image.avatar(),
      passportNumber: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
    };
  };
  for (let i = 0; i < 100; i++) {
    await prisma.user.create({ data: fakerUser() });
  }

  console.log('100 Users seed data loaded');
};

async function main() {
  await loadAdmin();
  await loadUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.log(error);
    await prisma.$disconnect();
  });
