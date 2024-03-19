import { PrismaClient } from '@prisma/client';
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
  for (let i = 0; i < 100; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'BLOCKED']),
        dob: faker.date.past(),
        address: {
          create: {
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            zipCode: faker.location.zipCode(),
          },
        },
        roles: {
          create: {
            roleId: faker.helpers.arrayElement(['ADMIN', 'USER', 'GUIDE', 'LEADER']),
          },
        },
        professional: {
          create: {
            companyName: faker.company.name(),
            passportNumber: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
            passportExpire: faker.date.future(),
            citizenNumber: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
            guide_license: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
            nma: faker.date.future(),
          },
        },
      },
    });
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
