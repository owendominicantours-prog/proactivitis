"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function resolveDestination(countryInput?: string | null, destinationInput?: string | null) {
  if (!destinationInput) return null;

  const destName = destinationInput.trim();
  if (!destName) return null;

  const destSlug = slugify(destName);
  const countryName = countryInput?.trim();
  const countrySlug = countryName ? slugify(countryName) : null;

  let countryId: string | undefined;
  if (countrySlug) {
    const country = await prisma.country.upsert({
      where: { slug: countrySlug },
      update: { name: countryName ?? countrySlug },
      create: {
        id: randomUUID(),
        name: countryName ?? countrySlug,
        slug: countrySlug
      }
    });
    countryId = country.id;
  }

  const destination = await prisma.destination.upsert({
    where: { slug: destSlug },
    update: {
      name: destName,
      ...(countryId ? { countryId } : {})
    },
    create: {
      id: randomUUID(),
      name: destName,
      slug: destSlug,
      countryId:
        countryId ??
        (
          await prisma.country.upsert({
            where: { slug: "global" },
            update: {},
            create: { id: randomUUID(), name: "Global", slug: "global" }
          })
        ).id
    }
  });

  return destination.id;
}

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

function parseTimeSlots(formData: FormData): PersistedTimeSlot[] {
  const rawValue = formData.get("timeSlots");
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    return JSON.parse(rawValue) as PersistedTimeSlot[];
  } catch {
    return [];
  }
}

export async function createTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");
  const supplierId = supplierProfile.id;
  const title = formData.get("title")?.toString() ?? "";
  const baseSlug = slugify(title);
  let slug = baseSlug || `tour-${Date.now()}`;
  const slugExists = await prisma.tour.findUnique({ where: { slug } });
  if (slugExists) slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;

  const languageValue = buildLanguagesString(formData);
  const categoryValue = buildCategoryString(formData);
  const itineraryValue = buildItineraryDescription(formData);
  const description = formData.get("description")?.toString() ?? title;
  const shortDescription = formData.get("shortDescription")?.toString() ?? "";
  const cancellationPolicy = formData.get("cancellation")?.toString() ?? "flexible";
  const confirmationType = formData.get("confirmationType")?.toString() ?? "instant";
  const physicalLevel = formData.get("physicalLevel")?.toString() ?? "";
  const meetingPoint = formData.get("meetingPoint")?.toString() ?? "";
  const meetingInstructions = formData.get("meetingInstructions")?.toString() ?? "";
  const pickup = formData.get("pickup")?.toString() ?? "";
  const requirements = formData.get("requirements")?.toString() ?? "";
  const terms = formData.get("terms")?.toString() ?? "";
  const minAgeValue = toInteger(formData.get("minAge"));
  const capacityValue = toInteger(formData.get("capacity")) ?? 1;
  const priceValue = toFloat(formData.get("price")) ?? 0;
  const priceChildValue = toFloat(formData.get("priceChild"));
  const priceYouthValue = toFloat(formData.get("priceYouth"));
  const durationValue = formData.get("duration")?.toString() ?? "";
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : null;
  const operatingDaysValue = formData.get("operatingDays")?.toString() ?? "[]";
  const blackoutDatesValue = formData.get("blackoutDates")?.toString() ?? "[]";
  const departureDestinationId = await resolveDestination(
    formData.get("country")?.toString(),
    formData.get("destination")?.toString()
  );

  const galleryUrls = formData
    .getAll("galleryUrls")
    .filter((val): val is string =>
      typeof val === "string" && val.trim().length > 0
    );

  const heroImage = formData.get("heroImageUrl")?.toString() || "/fototours/fototour.jpeg";
  const includes = formData.get("includes")?.toString() ?? "";

  await prisma.tour.create({
    data: {
      id: randomUUID(),
      title,
      slug,
      description,
      shortDescription,
      includes,
      duration: durationValue,
      location: formData.get("location")?.toString() ?? "",
      language: languageValue || "",
      category: categoryValue || "",
      price: priceValue,
      priceChild: priceChildValue,
      priceYouth: priceYouthValue,
      capacity: capacityValue,
      confirmationType,
      physicalLevel,
      minAge: minAgeValue,
      meetingPoint,
      meetingInstructions,
      pickup,
      requirements,
      cancellationPolicy,
      terms,
      timeOptions: timeOptionsValue,
      operatingDays: operatingDaysValue,
      blackoutDates: blackoutDatesValue,
      adminNote: itineraryValue,
      heroImage,
      gallery: galleryUrls.length ? JSON.stringify(galleryUrls) : undefined,
      status: "pending",
      supplierId,
      departureDestinationId
    }
  });

  redirect("/supplier/tours?status=sent");
}

export async function updateTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");
  const supplierId = supplierProfile.id;
  const tourId = formData.get("tourId")?.toString();
  if (!tourId) throw new Error("Tour no encontrado");

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new Error("Tour no existe");
  if (tour.supplierId !== supplierId && supplierId) throw new Error("No autorizado");

  const languageValue = buildLanguagesString(formData);
  const categoryValue = buildCategoryString(formData);
  const itineraryValue = buildItineraryDescription(formData);
  const description = formData.get("description")?.toString() ?? tour.title;
  const shortDescription = formData.get("shortDescription")?.toString() ?? tour.shortDescription ?? "";
  const cancellationPolicy = formData.get("cancellation")?.toString() ?? tour.cancellationPolicy ?? "flexible";
  const confirmationType = formData.get("confirmationType")?.toString() ?? tour.confirmationType ?? "instant";
  const physicalLevel = formData.get("physicalLevel")?.toString() ?? tour.physicalLevel ?? "";
  const meetingPoint = formData.get("meetingPoint")?.toString() ?? tour.meetingPoint ?? "";
  const meetingInstructions = formData.get("meetingInstructions")?.toString() ?? tour.meetingInstructions ?? "";
  const pickup = formData.get("pickup")?.toString() ?? tour.pickup ?? "";
  const requirements = formData.get("requirements")?.toString() ?? tour.requirements ?? "";
  const terms = formData.get("terms")?.toString() ?? tour.terms ?? "";
  const minAgeValue = toInteger(formData.get("minAge")) ?? tour.minAge ?? undefined;
  const capacityValue = toInteger(formData.get("capacity")) ?? tour.capacity ?? 1;
  const priceValue = toFloat(formData.get("price")) ?? tour.price;
  const priceChildValue = toFloat(formData.get("priceChild")) ?? tour.priceChild ?? undefined;
  const priceYouthValue = toFloat(formData.get("priceYouth")) ?? tour.priceYouth ?? undefined;
  const durationValue = formData.get("duration")?.toString() ?? tour.duration;
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : tour.timeOptions;
  const operatingDaysValue = formData.get("operatingDays")?.toString() ?? tour.operatingDays ?? "[]";
  const blackoutDatesValue = formData.get("blackoutDates")?.toString() ?? tour.blackoutDates ?? "[]";
  const departureDestinationId = await resolveDestination(
    formData.get("country")?.toString(),
    formData.get("destination")?.toString()
  );

  const galleryUrls = formData
    .getAll("galleryUrls")
    .filter((val): val is string =>
      typeof val === "string" && val.trim().length > 0
    );
  const heroImage = formData.get("heroImageUrl")?.toString() || tour.heroImage;
  const includes = formData.get("includes")?.toString() ?? tour.includes;

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      title: formData.get("title")?.toString() ?? tour.title,
      description,
      shortDescription,
      includes,
      duration: durationValue,
      location: formData.get("location")?.toString() ?? tour.location,
      language: languageValue || tour.language,
      category: categoryValue || tour.category,
      price: priceValue,
      priceChild: priceChildValue,
      priceYouth: priceYouthValue,
      capacity: capacityValue,
      confirmationType,
      physicalLevel,
      minAge: minAgeValue,
      meetingPoint,
      meetingInstructions,
      pickup,
      requirements,
      cancellationPolicy,
      terms,
      timeOptions: timeOptionsValue,
      operatingDays: operatingDaysValue,
      blackoutDates: blackoutDatesValue,
      adminNote: itineraryValue,
      heroImage,
      gallery: galleryUrls.length ? JSON.stringify(galleryUrls) : tour.gallery,
      departureDestinationId: departureDestinationId ?? tour.departureDestinationId
    }
  });

  redirect("/supplier/tours?status=updated");
}

export async function deleteSupplierTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");

  const tourId = formData.get("tourId")?.toString();
  if (!tourId) throw new Error("Tour no encontrado");

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new Error("Tour no existe");
  if (tour.supplierId !== supplierProfile.id) throw new Error("No autorizado");
  if (tour.status === "published") throw new Error("No puedes eliminar tours aprobados");

  await prisma.tour.delete({ where: { id: tourId } });
  revalidatePath("/supplier/tours");
}

function buildLanguagesString(formData: FormData) {
  const languages = formData
    .getAll("languages")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (languages.length) return languages.join(", ");
  const fallback = formData.get("language");
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "";
}

function buildItineraryDescription(formData: FormData) {
  const stops = formData
    .getAll("itineraryStops")
    .map((value) => {
      try {
        return JSON.parse(value as string);
      } catch {
        return null;
      }
    })
    .filter((stop): stop is { place: string; duration: string; note: string } =>
      Boolean(stop && stop.place && stop.duration)
    );
  if (!stops.length) return "";
  return stops
    .map(
      (stop, index) =>
      `${index + 1}. ${stop.duration} · ${stop.place}${stop.note ? ` – ${stop.note}` : ""}`
    )
    .join("\n");
}

function buildCategoryString(formData: FormData) {
  const categories = formData
    .getAll("categories")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (categories.length) return categories.join(", ");
  const fallback = formData.get("category");
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "";
}

function toInteger(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.trunc(parsed);
}

function toFloat(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}
