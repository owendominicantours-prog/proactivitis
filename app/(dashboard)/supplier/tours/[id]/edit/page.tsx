import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupplierTourCreateForm, type SavedDraft } from "@/components/supplier/SupplierTourCreateForm";
import { updateTourAction } from "@/app/(dashboard)/supplier/tours/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SupplierTourEditPage({ params }: Props) {
  const resolved = await params;
  const tourId = resolved?.id ?? "";
  if (!tourId) {
    notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      departureDestination: {
        include: { country: true }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const countries = await prisma.country.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" }
  });

  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, slug: true, countryId: true },
    orderBy: { name: "asc" }
  });

  const parseJsonArray = <T,>(value?: string | null): T[] => {
    if (!value) return [];
    try {
      return JSON.parse(value) as T[];
    } catch {
      return [];
    }
  };

  const parseDuration = () => {
    if (!tour.duration) return { value: "8", unit: "horas" };
    try {
      return JSON.parse(tour.duration) as { value: string; unit: string };
    } catch {
      return { value: tour.duration, unit: "horas" };
    }
  };

  const parsedDuration = parseDuration();
  const parsedTimeSlots = (() => {
    if (!tour.timeOptions) return undefined;
    try {
      return JSON.parse(tour.timeOptions) as { hour: number; minute: string; period: "AM" | "PM" }[];
    } catch {
      return undefined;
    }
  })();
  const parsedOperatingDays = parseJsonArray<string>(tour.operatingDays);
  const parsedBlackoutDates = parseJsonArray<string>(tour.blackoutDates);
  const parsedLanguages = (tour.language ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const parsedCategories = (tour.category ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const galleryImages = (tour.gallery ? JSON.parse(tour.gallery as string) : []).map((url: string, index: number) => ({
    url,
    name: `gallery-${index + 1}`
  }));
  const heroImage = tour.heroImage ? { url: tour.heroImage, name: "hero" } : null;

  const initialDraft: SavedDraft = {
    state: {
      title: tour.title,
      shortDescription: tour.shortDescription ?? "",
      description: tour.description ?? "",
      category: tour.category ?? "",
      price: tour.price?.toString() ?? "",
      priceChild: tour.priceChild?.toString() ?? "",
      priceYouth: tour.priceYouth?.toString() ?? "",
      capacity: tour.capacity?.toString() ?? "",
      confirmationType: tour.confirmationType ?? "instant",
      country: tour.departureDestination?.country?.name ?? "",
      destination: tour.departureDestination?.name ?? "",
      location: tour.location ?? "",
      notes: "",
      pickup: tour.pickup ?? "",
      pickupNotes: tour.pickupNotes ?? "",
      requirements: tour.requirements ?? "",
      cancellation: tour.cancellationPolicy ?? "flexible",
      terms: tour.terms ?? "",
      minAge: tour.minAge?.toString() ?? "",
      physicalLevel: tour.physicalLevel ?? "",
      meetingPoint: tour.meetingPoint ?? "",
      meetingInstructions: tour.meetingInstructions ?? ""
    },
    languages: parsedLanguages,
    categories: parsedCategories,
    timeSlots: parsedTimeSlots,
    daySelection: parsedOperatingDays,
    blackoutDates: parsedBlackoutDates,
    duration: parsedDuration,
    heroImage,
    galleryImages,
    pickupOptions: [],
    itineraryStops: []
  };

  return (
    <div className="px-4 py-6 md:px-6">
      <SupplierTourCreateForm
        mode="edit"
        action={updateTourAction}
        initialDraft={initialDraft}
        tourId={tour.id}
        countries={countries}
        destinations={destinations}
      />
    </div>
  );
}
