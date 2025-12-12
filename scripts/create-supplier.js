const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const email = "supplier@proactivitis.com";
  const password = "Supplier123!";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Supplier Proactivitis",
      password: hashedPassword,
      role: "SUPPLIER"
    },
    create: {
      id: randomUUID(),
      name: "Supplier Proactivitis",
      email,
      password: hashedPassword,
      role: "SUPPLIER"
    }
  });

  console.log(`Supplier account ready: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
