const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const tours = await prisma.tour.findMany({ take: 5 });
  console.log(tours.map((t) => ({ id: t.id, title: t.title, status: t.status })));
  await prisma.$disconnect();
})();
