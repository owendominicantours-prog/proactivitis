const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = [
  { slug: 'isla-saona-premium-experience', countrySlug: 'dominican-republic', destinationSlug: 'punta-cana' },
  { slug: 'atv-adventure-cenote-cave', countrySlug: 'dominican-republic', destinationSlug: 'macao' },
  { slug: 'whale-watching-samana', countrySlug: 'dominican-republic', destinationSlug: 'samana' },
  { slug: 'party-boat-punta-cana', countrySlug: 'dominican-republic', destinationSlug: 'punta-cana' },
  { slug: 'bayahibe-buggy-cave', countrySlug: 'dominican-republic', destinationSlug: 'bayahibe' }
];

async function main() {
  for (const entry of mapping) {
    const destination = await prisma.destination.findFirst({
      where: { slug: entry.destinationSlug, country: { slug: entry.countrySlug } }
    });
    if (!destination) {
      console.warn('missing destination', entry);
      continue;
    }
    await prisma.tour.updateMany({
      where: { slug: entry.slug },
      data: { departureDestinationId: destination.id, status: 'published' }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
