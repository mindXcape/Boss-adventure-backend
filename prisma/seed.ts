import { PrismaClient } from '@prisma/client';

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

async function main() {
  await loadAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.log(error);
    await prisma.$disconnect();
  });
