const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");

;(async () => {
  const user = await prisma.user.upsert({
    where: { email: "supplier@proactivitis.test" },
    update: {
      name: "Owen Supplier",
      role: "SUPPLIER"
    },
    create: {
      id: "supplier-sample-user",
      name: "Owen Supplier",
      email: "supplier@proactivitis.test",
      role: "SUPPLIER"
    }
  });

  const supplier = await prisma.supplierProfile.upsert({
    where: { userId: user.id },
    update: {
      company: "Owen Tours",
      approved: true
    },
    create: {
      id: "supplier-profile-1",
      userId: user.id,
      company: "Owen Tours",
      approved: true
    }
  });

  const tours = [
    {
      id: "tour-safari-proactivitis",
      title: "Safari Proactivitis en Punta Cana",
      slug: slugify("Safari Proactivitis en Punta Cana"),
      description: "Recorrido safari combinado con cultura y almuerzo típico.",
      location: "Punta Cana",
      price: 140,
      duration: "8 horas",
      language: "Español / Inglés",
      includes: "Transporte ida y vuelta;Guía profesional bilingüe;Almuerzo buffet",
      heroImage: "/fototours/fotosimple.jpg",
      gallery: JSON.stringify(["/fototours/fotosimple.jpg"]),
      status: "published",
      featured: true,
      supplierId: supplier.id
    }
  ];

  for (const data of tours) {
    const existing = await prisma.tour.findUnique({
      where: { slug: data.slug }
    });
    if (existing) {
      const { supplierId, ...rest } = data;
      await prisma.tour.update({
        where: { slug: data.slug },
        data: {
          ...rest,
          slug: data.slug
        }
      });
      continue;
    }

    await prisma.tour.create({
      data
    });
  }

  await prisma.tour.deleteMany({
    where: {
      slug: {
        notIn: tours.map((tour) => tour.slug)
      }
    }
  });

  console.log("Sample tours created.");
  await prisma.$disconnect();
})();
