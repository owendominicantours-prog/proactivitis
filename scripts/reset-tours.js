const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.tour.deleteMany({});
  await prisma.tour.createMany({
    data: [
      { title: "Saona Island Escape", price: 185, duration: "9h", description: "Saona con lunch y open bar.", language: "Español / Inglés", includes: ["Boat", "Lunch", "Snorkel"], location: "Punta Cana", supplierId: "supplier-1" },
      { title: "Buggy + Caballo + Parasailing", price: 240, duration: "7h", description: "Aventura completa.", language: "Español / Inglés", includes: ["Buggy", "Caballo", "Parasailing"], location: "Punta Cana", supplierId: "supplier-1" }
    ]
  });
  console.log("Tours reinicializados");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
