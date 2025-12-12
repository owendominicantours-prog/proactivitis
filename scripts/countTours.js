const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const count = await prisma.tour.count();
  console.log("count", count);
  await prisma.$disconnect();
})();
