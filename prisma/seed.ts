import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

enum ROLE {
  ADMIN = 'ADMIN',
  USER = 'CLIENT',
}

export const users = [
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

const banks = [
  { name: 'Nepal Bank Ltd.', class: 'A' },
  { name: 'Agriculture Development Bank Ltd.', class: 'A' },
  { name: 'Nabil Bank Ltd.', class: 'A' },
  { name: 'Nepal Investment Bank Ltd.', class: 'A' },
  { name: 'Standard Chartered Bank Nepal Ltd.', class: 'A' },
  { name: 'Himalayan Bank Ltd.', class: 'A' },
  { name: 'Nepal SBI Bank Ltd.', class: 'A' },
  { name: 'Nepal Bangaladesh Bank Ltd.', class: 'A' },
  { name: 'Everest Bank Ltd.', class: 'A' },
  { name: 'Kumari Bank Ltd.', class: 'A' },
  { name: 'Laxmi Bank Ltd.', class: 'A' },
  { name: 'Citizens Bank International Ltd.', class: 'A' },
  { name: 'Prime Commercial Bank Ltd.', class: 'A' },
  { name: 'Sunrise Bank Ltd.', class: 'A' },
  { name: 'Century Commercial Bank Ltd.', class: 'A' },
  { name: 'Sanima Bank Ltd.', class: 'A' },
  { name: 'Machhapuchhre Bank Ltd.', class: 'A' },
  { name: 'NIC Asia Bank Ltd.', class: 'A' },
  { name: 'Global IME Bank Ltd.', class: 'A' },
  { name: 'NMB Bank Ltd.', class: 'A' },
  { name: 'Prabhu Bank Ltd.', class: 'A' },
  { name: 'Siddhartha Bank Ltd.', class: 'A' },
  { name: 'Bank of Kathmandu Ltd.', class: 'A' },
  { name: 'Civil Bank Ltd.', class: 'A' },
  { name: 'Nepal Credit and Commerce Bank Ltd.', class: 'A' },
  { name: 'Janata Bank Nepal Ltd.', class: 'A' },
  { name: 'Rastriya Banijya Bank Ltd.', class: 'A' },
  { name: 'Mega Bank Nepal Ltd.', class: 'A' },
];

const loadBanks = async () => {
  banks.forEach(async bank => {
    await prisma.bank.create({
      data: {
        name: bank.name,
        class: bank.class,
      },
    });
  });

  console.log('Bank details added to the database');
};

const loadUsers = async () => {
  const banks = await prisma.bank.findMany({});
  const totalBanks = banks.length - 1;

  for (let i = 0; i < 100; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'BLOCKED']),
        dob: faker.date.past(),
        accountNumber: faker.finance.accountNumber(),
        bankId: banks[Math.floor(Math.random() * totalBanks)].id,
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
            roleId: faker.helpers.arrayElement(['ADMIN', 'CLIENT', 'GUIDE', 'LEADER']),
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

const admins = [
  {
    name: 'Dipesh Kumar Sah',
    roles: [ROLE.ADMIN],
    email: 'dipesh.mindxcape@gmail.com',
  },
  {
    name: 'Anwesh Gurung',
    roles: [ROLE.ADMIN],
    email: 'anwesh.mindxcape@gmail.com',
  },
  {
    name: 'Manjul Tamakar',
    roles: [ROLE.ADMIN],
    email: 'manjul.mindxcape@gmail.com',
  },
  {
    name: 'Subhashish Jung Shah',
    roles: [ROLE.ADMIN],
    email: 'subhashish.mindxcape@gmail.com',
  },
  {
    name: 'Ang Nuru Sherpa',
    roles: [ROLE.ADMIN],
    email: 'sherpanuru629@gmail.com',
  },
];

const loadProductionAdmins = async () => {
  for await (const user of admins) {
    await prisma.admin.create({
      data: {
        name: user.name,
        email: user.email,
        roles: user.roles,
        isActive: true,
      },
    });
  }
  console.log('Admin seed data loaded');
};
const loadProductionSeed = async () => {
  try {
    console.log('Loading production seed data');
    await loadBanks();
    await loadProductionAdmins();
    console.log('Production seed data loaded successfully');
  } catch (error) {
    console.log(error);
  }
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    await loadProductionSeed();
  } else {
    await loadAdmin();
    await loadBanks();
    await loadUsers();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    console.log(error);
    await prisma.$disconnect();
  });
