import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CountryWithMeta = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  shortDescription?: string | null;
  heroImage?: string | null;
  toursCount: number;
};

export type DestinationWithCountry = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  heroImage?: string | null;
  country: {
    id: string;
    name: string;
    slug: string;
    code?: string | null;
  };
};

export type TourForCard = {
  id: string;
  slug: string;
  title: string;
  price: number;
  duration: string;
  location: string;
  heroImage?: string | null;
  departureDestination?: {
    name: string;
    slug: string;
  } | null;
};

type TourWithDestination = {
  id: string;
  slug: string;
  title: string;
  price: number;
  duration: string;
  location: string;
  heroImage?: string | null;
  departureDestination?: {
    name: string;
    slug: string;
    country: {
      slug: string;
    };
  } | null;
};

const buildDestinationCountMaps = async () => {
  const grouped = await prisma.tour.groupBy({
    by: ["departureDestinationId"],
    where: {
      departureDestinationId: {
        not: null
      }
    },
    _count: {
      id: true
    }
  });

  const perDestination = new Map<string, number>();
  grouped.forEach((entry) => {
    if (!entry.departureDestinationId) return;
    perDestination.set(entry.departureDestinationId, entry._count.id);
  });

  const destinations = await prisma.destination.findMany({
    select: {
      id: true,
      countryId: true
    }
  });

  const perCountry = new Map<string, number>();
  destinations.forEach((destination) => {
    const count = perDestination.get(destination.id) ?? 0;
    perCountry.set(destination.countryId, (perCountry.get(destination.countryId) ?? 0) + count);
  });

  return { perCountry };
};

export async function getCountriesWithTours(): Promise<CountryWithMeta[]> {
  const { perCountry } = await buildDestinationCountMaps();

  const countries = await prisma.country.findMany({
    where: {
      destinations: {
        some: {
          tours: {
            some: {}
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      code: true,
      shortDescription: true,
      heroImage: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return countries.map((country) => ({
    ...country,
    toursCount: perCountry.get(country.id) ?? 0
  }));
}

export async function getCountryBySlug(slug: string) {
  return prisma.country.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      code: true,
      shortDescription: true,
      heroImage: true
    }
  });
}

export async function getDestinationsByCountrySlug(slug: string) {
  return prisma.destination.findMany({
    where: {
      country: {
        slug
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      heroImage: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getDestinationBySlugs(countrySlug: string, destinationSlug: string): Promise<DestinationWithCountry | null> {
  return prisma.destination.findFirst({
    where: {
      slug: destinationSlug,
      country: {
        slug: countrySlug
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      heroImage: true,
      country: {
        select: {
          id: true,
          name: true,
          slug: true,
          code: true
        }
      }
    }
  });
}

const selectTourForCard = Prisma.validator<Prisma.TourSelect>()({
  id: true,
  slug: true,
  title: true,
  price: true,
  duration: true,
  location: true,
  heroImage: true,
  departureDestination: {
    select: {
      name: true,
      slug: true,
      country: {
        select: {
          slug: true
        }
      }
    }
  }
});

const mapToTourForCard = (tour: TourWithDestination): TourForCard => ({
  id: tour.id,
  slug: tour.slug,
  title: tour.title,
  price: tour.price,
  duration: tour.duration,
  location: tour.location,
  heroImage: tour.heroImage,
  departureDestination:
    tour.departureDestination && tour.departureDestination.country.slug
      ? {
          name: tour.departureDestination.name,
          slug: tour.departureDestination.slug
        }
      : tour.departureDestination
});

export async function getToursByCountrySlug(countrySlug: string): Promise<TourForCard[]> {
  const tours = await prisma.tour.findMany({
    where: {
      departureDestination: {
        country: {
          slug: countrySlug
        }
      }
    },
    select: selectTourForCard,
    orderBy: {
      title: "asc"
    }
  });

  return tours.map(mapToTourForCard);
}

export async function getToursByDestinationSlug(countrySlug: string, destinationSlug: string): Promise<TourForCard[]> {
  const tours = await prisma.tour.findMany({
    where: {
      departureDestination: {
        slug: destinationSlug,
        country: {
          slug: countrySlug
        }
      }
    },
    select: selectTourForCard,
    orderBy: {
      title: "asc"
    }
  });

  return tours.map(mapToTourForCard);
}
