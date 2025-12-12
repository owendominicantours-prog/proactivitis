#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const supplierEmail = "supplier@proactivitis.com";
  const user = await prisma.user.findUnique({ where: { email: supplierEmail } });
  if (!user) {
    throw new Error(`No existe un usuario con email ${supplierEmail}`);
  }

  const profile = await prisma.supplierProfile.findFirst();
  if (!profile) {
    await prisma.supplierProfile.create({
      data: {
        id: "SUPPLIER-DEFAULT",
        userId: user.id,
        company: "Dominican Supplier",
        approved: true
      }
    });
    console.log("SupplierProfile creado y vinculado al usuario.");
  } else if (profile.userId !== user.id) {
    await prisma.supplierProfile.update({
      where: { id: profile.id },
      data: { userId: user.id, approved: true }
    });
    console.log("SupplierProfile existente actualizado para vincularse al usuario.");
  } else {
    console.log("SupplierProfile ya estaba vinculado al usuario.");
  }
}

main()
  .catch((error) => {
    console.error("Error al vincular supplier:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
