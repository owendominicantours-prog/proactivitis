import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { TourFilters } from "@/components/public/TourFilters";
import { buildTourFilter, type TourSearchParams } from "@/lib/filterBuilder";
import { getZoneInfo } from "@/lib/destinationInfo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DestinationPage({
  params,
  searchParams
}: {
  params: Promise<{ countrySlug: string; destinationSlug: string }>;
  searchParams?: TourSearchParams | Promise<TourSearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<TourSearchParams>).then === "function"
      ? await searchParams
      : searchParams;

  const destination = await prisma.destination.findFirst({
    where: {
      slug: resolvedParams.destinationSlug,
      country: { slug: resolvedParams.countrySlug }
    },
    include: {
      country: true,
      tours: {
        where: { status: "published" },
        select: {
          id: true,
          slug: true,
          title: true,
          heroImage: true,
          price: true,
          duration: true,
          language: true
        }
      }
    }
  });

  if (!destination) {
    notFound();
  }

  const filterParams: TourSearchParams = {
    ...(resolvedSearchParams ?? {}),
    country: destination.country.slug,
    destination: destination.slug
  };
  const where = buildTourFilter(filterParams);

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      departureDestination: { include: { country: true } }
    },
    take: 24
  });

  const languages = Array.from(new Set(tours.map((t) => t.language).filter(Boolean))) as string[];
  const durations = Array.from(new Set(tours.map((t) => t.duration).filter(Boolean))) as string[];

  const zoneInfo = getZoneInfo(resolvedParams.countrySlug, resolvedParams.destinationSlug);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Destino · {destination.name}
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{destination.name}</h1>
          <p className="text-sm text-slate-600">
            {zoneInfo?.summary ??
              destination.shortDescription ??
              `Descubre tours desde ${destination.name}, parte de ${destination.country.name} con playas, cultura y guías expertos.`}
          </p>
        </div>
      </section>

      {zoneInfo && (
        <section className="mx-auto mb-8 mt-6 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 md:w-1/3">
              <Image
                src={zoneInfo.hero.image ?? "/fototours/fotosimple.jpg"}
                alt={zoneInfo.zone}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3 md:w-2/3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{zoneInfo.hero.title}</p>
              <h2 className="text-3xl font-semibold text-slate-900">{zoneInfo.zone}</h2>
              <p className="text-sm text-slate-600">{zoneInfo.hero.subtitle}</p>
              <p className="text-sm text-slate-500">{zoneInfo.summary}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {zoneInfo.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-600">
                    {highlight}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Datos prácticos</p>
                <p>Temporada: {zoneInfo.practical.bestSeason}</p>
                <p>Transporte: {zoneInfo.practical.transport}</p>
                <p>Tip local: {zoneInfo.practical.localTip}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <section>
          <TourFilters
            countries={[{ name: destination.country.name, slug: destination.country.slug }]}
            destinations={[
              { name: destination.name, slug: destination.slug, countrySlug: destination.country.slug }
            ]}
            languages={languages}
            durations={durations}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Tours que salen de {destination.name}</h2>
          <p className="text-sm text-slate-500">
            Cada tour está conectado a esta zona y respeta itinerarios locales, guías bilingües y logística confiable.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tours.map((tour) => (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-400"
              >
                <h3 className="text-lg font-semibold text-slate-900">{tour.title}</h3>
                <p className="text-xs text-slate-500">
                  Desde ${tour.price.toFixed(0)} · {tour.duration ?? "Duración pendiente"}
                </p>
              </Link>
            ))}
            {tours.length === 0 && (
              <p className="text-sm text-slate-500">No hay tours publicados para esta zona aún.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
