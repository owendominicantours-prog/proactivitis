const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const { count } = await prisma.tour.updateMany({
    where: { status: { not: 'published' } },
    data: { status: 'published' }
  });
  console.log(`Updated ${count} tours to published`);
  await prisma.$disconnect();
})();
