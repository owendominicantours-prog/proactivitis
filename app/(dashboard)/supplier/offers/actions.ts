import { prisma } from "@/lib/prisma";

export async function createSupplierOfferAction(formData: FormData) {
  "use server";
  const tourId = formData.get("tourId")?.toString() ?? "";
  const title = formData.get("title")?.toString() ?? "Oferta";
  const description = formData.get("description")?.toString() ?? "";
  await prisma.offer.create({
    data: {
      tourId,
      title,
      description
    }
  });
  return { success: true };
}
