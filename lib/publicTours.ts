import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicTourFilter = {
  countrySlug?: string;
  destinationSlug?: string;
  duration?: string;
  language?: string;
  priceMin?: number;
  priceMax?: number;
};

const selectTourFields = Prisma.validator<Prisma.TourSelect>()({
  id: true,
  slug: true,
  title: true,
  description: true,
  location: true,
  price: true,
  duration: true,
  language: true,
  includes: true,
  heroImage: true,
  gallery: true,
  departureDestination: {
    select: {
      slug: true,
      country: {
        select: {
          slug: true,
          name: true
        }
      }
    }
  }
});

export type PublicTour = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  language: string;
  includes: string[];
  heroImage: string;
  gallery: string[];
  rating: number;
  destination: string | null;
  country: string | null;
};

const normalizeIncludes = (value?: string | null): string[] => {
  if (!value) return [];
  return value
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const fallbackImage = "/fototours/fotosimple.jpg";

const slugToLabel = (value?: string) => (value ? value.replace(/-/g, " ") : "");

export async function getPublishedTours(filter: PublicTourFilter = {}, limit = 24): Promise<PublicTour[]> {
  const countryClause =
    filter.countrySlug
      ? {
          OR: [
            {
              departureDestination: {
                country: {
                  slug: filter.countrySlug
                }
              }
            },
            {
              location: {
                contains: slugToLabel(filter.countrySlug),
                mode: "insensitive"
              }
            }
          ]
        }
      : undefined;

  const destinationClause =
    filter.destinationSlug
      ? {
          OR: [
            {
              departureDestination: {
                slug: filter.destinationSlug
              }
            },
            {
              location: {
                contains: slugToLabel(filter.destinationSlug),
                mode: "insensitive"
              }
            }
          ]
        }
      : undefined;

  const where: Prisma.TourWhereInput = {
    status: "published",
    AND: [
      countryClause,
      destinationClause,
      filter.duration
        ? {
            duration: {
              contains: filter.duration,
              mode: "insensitive"
            }
          }
        : undefined,
      filter.language
        ? {
            language: {
              contains: filter.language,
              mode: "insensitive"
            }
          }
        : undefined,
      filter.priceMin != null
        ? {
            price: {
              gte: filter.priceMin
            }
          }
        : undefined,
      filter.priceMax != null
        ? {
            price: {
              lte: filter.priceMax
            }
          }
        : undefined
    ].filter(Boolean)
  };

  const tours = await prisma.tour.findMany({
    where,
    select: selectTourFields,
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return tours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    description: tour.description,
    location: tour.location,
    price: tour.price,
    duration: tour.duration,
    language: tour.language,
    includes: normalizeIncludes(tour.includes),
    heroImage: tour.heroImage ?? fallbackImage,
    gallery:
      (tour.gallery ? JSON.parse(tour.gallery as string) : [tour.heroImage ?? fallbackImage]).map((entry) =>
        typeof entry === "string" ? entry : fallbackImage
      ),
    rating: 4.9,
    destination: tour.departureDestination?.slug ?? null,
    country: tour.departureDestination?.country?.name ?? null
  }));
}

export async function getFeaturedTour(): Promise<PublicTour | null> {
  const tours = await getPublishedTours({}, 1);
  return tours[0] ?? null;
}
