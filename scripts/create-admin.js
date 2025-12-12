const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@proactivitis.com";
  const password = "Admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin Proactivitis",
      password: hashedPassword,
      role: "ADMIN",
      supplierApproved: true
    },
    create: {
      id: randomUUID(),
      name: "Admin Proactivitis",
      email,
      password: hashedPassword,
      role: "ADMIN",
      supplierApproved: true
    }
  });

  console.log(`Admin account ensured: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
