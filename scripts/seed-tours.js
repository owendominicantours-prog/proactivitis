const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const suppliers = await prisma.supplierProfile.findMany({
    include: { user: true }
  });

  if (!suppliers.length) {
    throw new Error("No hay suppliers en la base de datos.");
  }

  await prisma.tour.deleteMany(); // para evitar duplicados

  const tours = [
    {
      title: "Safari Caribeño desde Punta Cana",
      price: 185,
      duration: "Día completo",
      description:
        "Explora el campo dominicano, visita plantaciones y disfruta un almuerzo típico dentro de un camión safari.",
      language: "Español / Inglés",
      includes: "Transporte desde hoteles, guía bilingüe, almuerzo buffet",
      location: "República Dominicana",
      country: "República Dominicana",
      supplierCompany: "Aventuras Dominicanas",
      featured: true,
      status: "published"
    },
    {
      title: "Avistamiento de ballenas en Samaná",
      price: 220,
      duration: "Día completo",
      description:
        "Excursión premium a Samaná con navegación privada, avistamiento de ballenas y almuerzo en playa.",
      language: "Inglés / Español",
      includes: "Navegación, entrada al parque, snacks, almuerzo",
      location: "Samaná",
      country: "República Dominicana",
      supplierCompany: "Caribe Tours Group",
      featured: true,
      status: "published"
    },
    {
      title: "Tour gastronómico por Bogotá",
      price: 140,
      duration: "Medio día",
      description:
        "Saborea la cocina colombiana, visita mercados y termina en rooftop con vista a la ciudad.",
      language: "Español",
      includes: "Degustaciones, guía local, transporte urbano",
      location: "Bogotá",
      country: "Colombia",
      supplierCompany: "Isla Adventures Co.",
      featured: false,
      status: "needs_changes"
    },
    {
      title: "Caminata por los Andes y cafetales",
      price: 260,
      duration: "Día completo",
      description:
        "Ruta por los pueblos de Boyacá con senderismo suave y experiencia de café con productores.",
      language: "Español / Inglés",
      includes: "Guía, snacks, transporte, cata de café",
      location: "Boyacá",
      country: "Colombia",
      supplierCompany: "Aventuras Dominicanas",
      featured: false,
      status: "draft"
    },
    {
      title: "Ruinas Mayas y playa en Tulum",
      price: 210,
      duration: "Día completo",
      description:
        "Combina historia maya con relax en playa privada y almuerzo frente al mar Caribe.",
      language: "Inglés / Español",
      includes: "Entrada a ruinas, snorkel, almuerzo",
      location: "Tulum",
      country: "México",
      supplierCompany: "Caribe Tours Group",
      featured: true,
      status: "pending"
    },
    {
      title: "Jardines de salitre en el Lago de Nicaragua",
      price: 180,
      duration: "Día completo",
      description:
        "Navega por el lago, visita isletas volcánicas y disfruta lunch criollo en un rancho privado.",
      language: "Español / Inglés",
      includes: "Navegación, guía, lunch",
      location: "Granada",
      country: "Nicaragua",
      supplierCompany: "Isla Adventures Co.",
      featured: false,
      status: "published"
    },
    {
      title: "Travesía en catamarán por Punta Cana",
      price: 200,
      duration: "Medio día",
      description:
        "Catamarán premium, snorkel, barra libre y música caribeña para grupos pequeños.",
      language: "Inglés / Español",
      includes: "Equipo snorkel, bebidas, guía",
      location: "Bávaro",
      country: "República Dominicana",
      supplierCompany: "Caribe Tours Group",
      featured: true,
      status: "draft"
    }
  ];

  for (const tour of tours) {
    const supplier = suppliers.find((s) => s.company === tour.supplierCompany);
    if (!supplier) {
      console.warn(`No se encontró supplier para ${tour.supplierCompany}, se salta el tour ${tour.title}`);
      continue;
    }
    await prisma.tour.create({
      data: {
        title: tour.title,
        price: tour.price,
        duration: tour.duration,
        description: tour.description,
        language: tour.language,
        includes: tour.includes,
        location: tour.location,
        supplierId: supplier.id,
        featured: tour.featured,
        status: tour.status ?? "published",
        heroImage: "/fototours/fototour.jpeg",
        gallery: JSON.stringify(["/fototours/fototour.jpeg"])
      }
    });
  }

  console.log("Tours creados con éxito.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
