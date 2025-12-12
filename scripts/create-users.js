const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const users = [
  {
    role: "ADMIN",
    name: "Owen Dominicanproactivitis",
    email: "admin@proactivitis.com",
    password: "Admin123!"
  },
  {
    role: "SUPPLIER",
    name: "Supplier Demo",
    email: "supplier@proactivitis.com",
    password: "Supplier123!"
  },
  {
    role: "AGENCY",
    name: "Agency Demo",
    email: "agency@proactivitis.com",
    password: "Agency123!"
  },
  {
    role: "CUSTOMER",
    name: "Traveler Demo",
    email: "customer@proactivitis.com",
    password: "Customer123!"
  }
];

async function main() {
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: hashed,
        supplierApproved: user.role === "SUPPLIER"
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: hashed,
        supplierApproved: user.role === "SUPPLIER"
      }
    });
    console.log(`Upserted ${user.role} <${user.email}>`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
