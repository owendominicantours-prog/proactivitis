const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const countries = await prisma.country.findMany({
    include: { destinations: { select: { name: true } } },
    orderBy: { name: 'asc' }
  });
  console.log(JSON.stringify(countries.map((country) => ({
    country: country.name,
    zones: country.Destination.map((zone) => zone.name)
  })), null, 2));
  await prisma.$disconnect();
})();
