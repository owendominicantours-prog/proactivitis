export type TourSearchParams = {
  country?: string;
  destination?: string;
  minPrice?: string;
  maxPrice?: string;
  language?: string;
  duration?: string;
};

export function buildTourFilter(params: TourSearchParams = {}) {
  const where: any = { status: "published" };

  if (params.country) {
    where.departureDestination = {
      ...(where.departureDestination ?? {}),
      is: {
        ...(where.departureDestination?.is ?? {}),
        country: { slug: params.country }
      }
    };
  }

  if (params.destination) {
    where.departureDestination = {
      ...(where.departureDestination ?? {}),
      is: {
        ...(where.departureDestination?.is ?? {}),
        slug: params.destination
      }
    };
  }

  const min = params.minPrice ? Number(params.minPrice) : undefined;
  const max = params.maxPrice ? Number(params.maxPrice) : undefined;

  if (!Number.isNaN(min) && min !== undefined) {
    where.price = { ...(where.price ?? {}), gte: min };
  }

  if (!Number.isNaN(max) && max !== undefined) {
    where.price = { ...(where.price ?? {}), lte: max };
  }

  if (params.language) {
    where.language = { contains: params.language, mode: "insensitive" };
  }

  if (params.duration) {
    where.duration = params.duration;
  }

  return where;
}
