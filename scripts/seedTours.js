const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const tours = [
  {
    title: "Isla Saona All-Inclusive Premium Experience",
    country: "Dominican Republic",
    destination: "Punta Cana",
    location: "Bayahibe · Punta Cana",
    duration: "10 hours",
    language: "English, Spanish",
    price: 75,
    description:
      "Enjoy a full-day all-inclusive adventure to the stunning Saona Island. Sail on a catamaran, swim in a natural pool with starfish, relax on turquoise beaches and enjoy a Dominican buffet lunch.",
    includes: [
      "Round-trip hotel transportation",
      "Catamaran cruise to Saona",
      "Speedboat return",
      "Dominican buffet lunch",
      "Open bar with local drinks",
      "Professional bilingual guide",
      "Swimming at Natural Pool"
    ],
    meetingPoint: "Pickup included from Punta Cana, Bávaro and Uvero Alto hotels."
  },
  {
    title: "ATV Adventure + Cenote Cave + Macao Beach",
    country: "Dominican Republic",
    destination: "Macao",
    location: "Macao · Punta Cana",
    duration: "4 hours",
    language: "English, Spanish, French",
    price: 45,
    description:
      "Jump into an adrenaline-filled ATV adventure through Punta Cana’s jungle trails. Visit a natural cenote cave for swimming and finish at the famous Macao Beach.",
    includes: [
      "4x4 ATV vehicle",
      "Protective helmet",
      "Visit to Dominican ranch (coffee & cocoa tasting)",
      "Cenote swimming stop",
      "Guide and transportation"
    ],
    meetingPoint: "Hotel pickup included from Punta Cana, Bávaro and nearby areas."
  },
  {
    title: "Whale Watching in Samaná + Cayo Levantado Day Trip",
    country: "Dominican Republic",
    destination: "Samana",
    location: "Samaná Bay",
    duration: "12 hours",
    language: "English, Spanish, French",
    price: 99,
    description:
      "Experience humpback whales migrating to Samaná Bay. After the observation tour, enjoy lunch and relax at the tropical paradise of Cayo Levantado.",
    includes: [
      "Round-trip transportation",
      "Whale watching boat tour",
      "Marine biologist commentary",
      "Buffet lunch",
      "Cayo Levantado beach access"
    ],
    meetingPoint: "Pickup from assigned meeting point or hotel depending on area."
  },
  {
    title: "Party Boat Punta Cana – Snorkeling + Natural Pool + Open Bar",
    country: "Dominican Republic",
    destination: "Punta Cana",
    location: "Bávaro Beach",
    duration: "3 hours",
    language: "English, Spanish",
    price: 55,
    description:
      "Caribbean party on a catamaran with snorkeling, open bar, music and a stop at the famous Natural Pool. Ideal for groups and celebrations.",
    includes: ["Snorkeling gear", "Open bar (rum, beer, soft drinks)", "Entertainment crew", "Snacks", "Round-trip transportation"],
    meetingPoint: "Meeting point near Jellyfish Restaurant or hotel pickup."
  },
  {
    title: "Bayahibe Off-Road Buggy + Cave Swim Experience",
    country: "Dominican Republic",
    destination: "Bayahibe",
    location: "Bayahibe",
    duration: "3.5 hours",
    language: "English, Spanish, Italian",
    price: 60,
    description:
      "Drive powerful buggies through Bayahibe’s rural landscape, cross sugarcane fields, visit a Dominican house for tastings, and swim in a natural cave.",
    includes: ["Buggy doble", "Tour guide", "Transportation", "Cave swimming access"],
    meetingPoint: "Pickup included from hotels in Bayahibe and Dominicus."
  }
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  let supplier = await prisma.supplierProfile.findFirst();
  if (!supplier) {
    const user = await prisma.user.upsert({
      where: { email: "supplier@proactivitis.com" },
      update: {},
      create: {
        id: randomUUID(),
        email: "supplier@proactivitis.com",
        name: "Supplier Proactivitis",
        role: "SUPPLIER",
        password: "Supplier123!"
      }
    });
    supplier = await prisma.supplierProfile.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        company: "Default Supplier",
        approved: true
      }
    });
  }

  for (const tour of tours) {
    const countrySlug = slugify(tour.country);
    const destSlug = slugify(tour.destination);

    const country = await prisma.country.upsert({
      where: { slug: countrySlug },
      update: { name: tour.country },
      create: {
        id: randomUUID(),
        name: tour.country,
        slug: countrySlug,
        shortDescription: tour.country
      }
    });

    const destination = await prisma.destination.upsert({
      where: { slug: destSlug },
      update: { name: tour.destination, countryId: country.id },
      create: {
        id: randomUUID(),
        name: tour.destination,
        slug: destSlug,
        countryId: country.id,
        shortDescription: tour.destination
      }
    });

    const baseSlug = slugify(tour.title);
    let slug = baseSlug;
    const exists = await prisma.tour.findUnique({ where: { slug } });
    if (exists) slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;

    const gallery = Array(7).fill("/fototours/fotosimple.jpg");

    await prisma.tour.upsert({
      where: { slug },
      update: {},
      create: {
        id: `seed-${slug}`,
        title: tour.title,
        slug,
        price: tour.price,
        duration: tour.duration,
        description: tour.description,
        language: tour.language,
        location: tour.location,
        heroImage: "/fototours/fotosimple.jpg",
        gallery: JSON.stringify(gallery),
        includes: tour.includes.join("; "),
        meetingPoint: tour.meetingPoint,
        status: "published",
        supplierId: supplier.id,
        departureDestinationId: destination.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
