"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CountryForm = {
  name: string;
  slug: string;
  shortDescription?: string;
};

type DestinationForm = {
  name: string;
  slug: string;
  countryId: string;
};

export async function addCountryAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const shortDescription = formData.get("shortDescription");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre del país.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug para el país.");
  }

  await prisma.country.upsert({
    where: { slug: slug.trim() },
    update: {
      name: name.trim(),
      shortDescription: typeof shortDescription === "string" ? shortDescription.trim() : undefined
    },
    create: {
      name: name.trim(),
      shortDescription: typeof shortDescription === "string" ? shortDescription.trim() : undefined,
      slug: slug.trim()
    }
  });

  revalidatePath("/tours");
  revalidatePath("/dashboard");
}

export async function addDestinationAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const countryId = formData.get("countryId");

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Ingresa el nombre de la zona.");
  }
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    throw new Error("Ingresa un slug para la zona.");
  }
  if (!countryId || typeof countryId !== "string" || !countryId.trim()) {
    throw new Error("Selecciona el país asociado.");
  }

  await prisma.destination.upsert({
    where: { slug: slug.trim() },
    update: {
      name: name.trim(),
      countryId: countryId.trim()
    },
    create: {
      name: name.trim(),
      slug: slug.trim(),
      countryId: countryId.trim()
    }
  });

  revalidatePath("/tours");
  revalidatePath("/dashboard");
}
