const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando suplidores y agencias actuales...");
  await prisma.conversationParticipant.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.agencyProfile.deleteMany();
  await prisma.supplierProfile.deleteMany();

  const suppliers = [
    {
      email: "aventuras@proactivitis.com",
      name: "Aventuras Proactivitis",
      company: "Aventuras Dominicanas",
      password: "Secret123!",
      role: "SUPPLIER"
    },
    {
      email: "caribe@proactivitis.com",
      name: "Caribe Tours",
      company: "Caribe Tours Group",
      password: "Secret123!",
      role: "SUPPLIER"
    },
    {
      email: "isla@proactivitis.com",
      name: "Isla Adventures",
      company: "Isla Adventures Co.",
      password: "Secret123!",
      role: "SUPPLIER"
    }
  ];

  const agencies = [
    {
      email: "travel@proactivitis.com",
      name: "Travel Partners",
      companyName: "Travel Partners RD",
      password: "Secret123!",
      role: "AGENCY"
    },
    {
      email: "booking@proactivitis.com",
      name: "Booking Lab",
      companyName: "Booking Lab Caribe",
      password: "Secret123!",
      role: "AGENCY"
    }
  ];

  const hash = (input) => `***${input}***`;

  for (const supplier of suppliers) {
    const user = await prisma.user.create({
      data: {
        email: supplier.email,
        name: supplier.name,
        role: supplier.role,
        password: hash(supplier.password)
      }
    });
    await prisma.supplierProfile.create({
      data: {
        userId: user.id,
        company: supplier.company,
        approved: true
      }
    });
  }

  for (const agency of agencies) {
    const user = await prisma.user.create({
      data: {
        email: agency.email,
        name: agency.name,
        role: agency.role,
        password: hash(agency.password)
      }
    });
    await prisma.agencyProfile.create({
      data: {
        userId: user.id,
        companyName: agency.companyName
      }
    });
  }

  console.log("Semilla creada: suplidores y agencias.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
