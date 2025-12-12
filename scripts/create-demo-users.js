const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

const demoUsers = [
  { email: 'admin@proactivitis.com', name: 'Proactivitis Admin', role: 'ADMIN', password: 'Admin123!' },
  { email: 'supplier@proactivitis.com', name: 'Demo Supplier', role: 'SUPPLIER', password: 'Supplier123!' },
  { email: 'agency@proactivitis.com', name: 'Demo Agency', role: 'AGENCY', password: 'Agency123!' },
  { email: 'customer@proactivitis.com', name: 'Demo Customer', role: 'CUSTOMER', password: 'Customer123!' }
];

async function main() {
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: passwordHash
      },
      create: {
        id: randomUUID(),
        email: user.email,
        name: user.name,
        role: user.role,
        password: passwordHash
      }
    });
  }
  console.log('Demo users seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
