const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

const COUNTRIES = [
  { slug: 'dominican-republic', name: 'Dominican Republic', code: 'DO', shortDescription: 'Islas caribeñas con playas de arena blanca y cultura viva.' },
  { slug: 'mexico', name: 'Mexico', code: 'MX', shortDescription: 'Sabores, playas y ciudades vibrantes.' },
  { slug: 'united-states', name: 'United States', code: 'US', shortDescription: 'Experiencias diversas desde la costa este hasta la oeste.' },
  { slug: 'spain', name: 'Spain', code: 'ES', shortDescription: 'Cultura, gastronomía y costas mediterráneas.' },
  { slug: 'brazil', name: 'Brazil', code: 'BR', shortDescription: 'Ritmos vibrantes, naturaleza y playas icónicas.' },
  { slug: 'france', name: 'France', code: 'FR', shortDescription: 'Ciudades románticas y paisajes del sur europeo.' },
  { slug: 'italy', name: 'Italy', code: 'IT', shortDescription: 'Historia, arte y gastronomía en cada rincón.' },
  { slug: 'greece', name: 'Greece', code: 'GR', shortDescription: 'Islas idílicas, historia antigua e islas de ensueño.' },
  { slug: 'thailand', name: 'Thailand', code: 'TH', shortDescription: 'Playas, templos y experiencias asiáticas auténticas.' },
  { slug: 'japan', name: 'Japan', code: 'JP', shortDescription: 'Tecnología, tradiciones milenarias y naturaleza serena.' }
];

const DESTINATIONS = {
  'dominican-republic': ['punta-cana', 'bayahibe', 'samana', 'santo-domingo'],
  mexico: ['cancun', 'tulum', 'mexico-city', 'playa-del-carmen', 'cozumel'],
  'united-states': ['new-york-city', 'miami', 'orlando', 'los-angeles', 'las-vegas', 'san-francisco', 'chicago', 'honolulu'],
  spain: ['barcelona', 'madrid', 'sevilla', 'valencia', 'ibiza', 'tenerife', 'mallorca'],
  brazil: ['rio-de-janeiro', 'sao-paulo', 'salvador', 'florianopolis'],
  france: ['paris', 'nice', 'lyon', 'marseille'],
  italy: ['rome', 'venice', 'florence', 'milan', 'naples'],
  greece: ['athens', 'santorini', 'mykonos', 'crete'],
  thailand: ['bangkok', 'phuket', 'chiang-mai'],
  japan: ['tokyo', 'osaka', 'kyoto']
};

const heroImage = '/fototours/fototour.jpeg';

const DEMO_USERS = [
    { email: 'admin@proactivitis.com', name: 'Proactivitis Admin', role: 'ADMIN', password: 'Admin123!' },
  { email: 'supplier@proactivitis.com', name: 'Demo Supplier', role: 'SUPPLIER', password: 'Supplier123!' },
  { email: 'agency@proactivitis.com', name: 'Demo Agency', role: 'AGENCY', password: 'Agency123!' },
  { email: 'customer@proactivitis.com', name: 'Demo Customer', role: 'CUSTOMER', password: 'Customer123!' }
];

const humanize = (slug) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

async function seedCountriesAndDestinations() {
  for (const countryPayload of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { slug: countryPayload.slug },
      update: {
        name: countryPayload.name,
        code: countryPayload.code,
        shortDescription: countryPayload.shortDescription,
        heroImage
      },
      create: {
        ...countryPayload,
        heroImage
      }
    });

    const destinationSlugs = DESTINATIONS[country.slug] ?? [];
    await Promise.all(
      destinationSlugs.map((slug) =>
        prisma.destination.upsert({
          where: { slug },
          update: {
            name: humanize(slug),
            shortDescription: 'Touristic area curated for Proactivitis travelers.',
            heroImage,
            countryId: country.id
          },
          create: {
            name: humanize(slug),
            slug,
            shortDescription: 'Touristic area curated for Proactivitis travelers.',
            heroImage,
            countryId: country.id
          }
        })
      )
    );
  }
}

async function seedDemoUsers() {
  for (const user of DEMO_USERS) {
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
    if (user.role === "SUPPLIER") {
      const supplierUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (supplierUser) {
        await prisma.supplierProfile.upsert({
          where: { userId: supplierUser.id },
          update: {
            company: "Demo Supplier",
            approved: true
          },
          create: {
            id: randomUUID(),
            userId: supplierUser.id,
            company: "Demo Supplier",
            approved: true
          }
        });
      }
    }
  }
}

async function main() {
  await seedDemoUsers();
  await seedCountriesAndDestinations();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
