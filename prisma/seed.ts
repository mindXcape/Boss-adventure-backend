import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

enum ROLE {
  ADMIN = 'ADMIN',
  USER = 'CLIENT',
}

const images = [
  'e270e0df334606f951a89162eaf3614e2e131dfa398ee459a913715d2392a9241714028627549.jpg',
  '62305731fa5683a42aad8fffc15e23fc4bb055ccad709a5b4625feb5786ba42b1714028654322.jpg',
  '27f77530e0aeff199afd6b39a0f990345f98497b6fbe9a68f8997372d42c40191714028984715.jpg',
  'cdb309726e4743acfaba288f8184523b4735700ffe1534688f4846c367bd9c6a1714029024709.jpg',
  '8f3b5edb8de2838a952a6d621a4cabb4ed7c4952f66513669b542179a16058c11714029046619.jpg',
];

export const users = [
  {
    name: 'Dipesh Kumar Sah',
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
    name: 'Manjul Mindxcape',
    roles: [ROLE.ADMIN],
    email: 'manjul.mindxcape@gmail.com',
  },
  {
    name: 'Dipesh Mindxcape',
    roles: [ROLE.ADMIN],
    email: 'dipesh.mindxcape@gmail.com',
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
    const role: Role = faker.helpers.arrayElement([
      'ADMIN',
      'CLIENT',
      'GUIDE',
      'LEADER',
      'PORTER',
      'ASST_GUIDE',
    ]);
    await prisma.user.create({
      data: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'BLOCKED']),
        dob: faker.date.past(),
        accountNumber: faker.finance.accountNumber(),
        designation:
          role === 'ADMIN' ? faker.helpers.arrayElement(['DRIVER', 'ACCOUNT', 'MANAGER']) : null,
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
            roleId: role,
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

const loadFranchises = async () => {
  const franchises = [
    'Mount Everest',
    'Kalapatthar',
    'Annapurna Base Camp',
    'Langtang',
    'Manaslu',
    'Gosaikunda',
    'Mardi Himal',
    'Upper Mustang',
    'Rara Lake',
    'Dolpo',
    'Kanchenjunga',
    'Rolwaling',
    'Ganesh Himal',
    'Dhaulagiri',
  ];

  franchises.forEach(async franchise => {
    await prisma.franchise.create({
      data: {
        name: franchise,
        image: faker.helpers.arrayElement(images),
      },
    });
  });
};

const loadHotels = async () => {
  const hotels = [
    {
      name: 'Hotel Everest View',
      image: faker.helpers.arrayElement(images),
    },
    {
      name: 'Hotel Annapurna',
      image: faker.helpers.arrayElement(images),
    },
    {
      name: 'Hotel Yak and Yeti',
      image: faker.helpers.arrayElement(images),
    },
    {
      name: 'Hotel Radisson',
      image: faker.helpers.arrayElement(images),
    },
  ];

  const branches = Array.from({ length: 10 }, () => ({
    name: faker.internet.userName(),
    state: faker.location.state(),
    city: faker.location.city(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    poc: faker.person.fullName(),
    pocPhone: faker.phone.number(),
    pocDesignation: faker.person.jobType(),
  }));
  hotels.forEach(async hotel => {
    await prisma.hotel.create({
      data: {
        name: hotel.name,
        image: hotel.image,
        branch: {
          createMany: {
            data: branches,
          },
        },
      },
    });
  });
};

const loadLodge = async () => {
  const lodges = [
    {
      name: 'Lodge Everest View',
      image: faker.helpers.arrayElement(images),
    },
    {
      name: 'Lodge Annapurna',
      image: faker.helpers.arrayElement(images),
    },
  ];

  const branches = Array.from({ length: 5 }, () => ({
    name: faker.internet.userName(),
    state: faker.location.state(),
    city: faker.location.city(),
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    poc: faker.person.fullName(),
    pocPhone: faker.phone.number(),
    pocDesignation: faker.person.jobType(),
  }));

  lodges.forEach(async lodge => {
    await prisma.lodge.create({
      data: {
        name: lodge.name,
        image: lodge.image,
        branch: {
          createMany: { data: branches },
        },
      },
    });
  });
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
    await loadFranchises();
    await loadHotels();
    await loadLodge();
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
