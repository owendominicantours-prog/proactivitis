"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateSupplierProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Es necesario iniciar sesión para actualizar el perfil.");
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!supplier) {
    throw new Error("No se encontró un perfil de proveedor asociado.");
  }

  const companyValue = formData.get("company");
  const nameValue = formData.get("name");

  const updatedCompany = typeof companyValue === "string" ? companyValue.trim() : undefined;
  const updatedName = typeof nameValue === "string" ? nameValue.trim() : undefined;

  await prisma.$transaction(async (tx) => {
    if (updatedCompany && updatedCompany !== "") {
      await tx.supplierProfile.update({
        where: { id: supplier.id },
        data: { company: updatedCompany }
      });
    }
    if (updatedName && updatedName !== "") {
      await tx.user.update({
        where: { id: userId },
        data: { name: updatedName }
      });
    }
  });

  revalidatePath("/supplier/profile");
}
