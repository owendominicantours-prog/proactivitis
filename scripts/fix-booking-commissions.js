const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany();
  for (const booking of bookings) {
    const supplierAmount = booking.totalAmount * 0.8;
    const platformFee = booking.totalAmount - supplierAmount;
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        supplierAmount,
        platformFee,
        agencyFee: platformFee * 0.1
      }
    });
  }
  console.log("PRX-996122 corrections applied");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
