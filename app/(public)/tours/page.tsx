import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildTourFilter, TourSearchParams } from "@/lib/filterBuilder";
import { TourFilters } from "@/components/public/TourFilters";
import { DynamicImage } from "@/components/shared/DynamicImage";
import type { DurationOption } from "@/components/public/TourFilters";

const parseDurationMeta = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      const { value: durationValue, unit } = parsed;
      if (typeof durationValue === "string" && durationValue.trim() && typeof unit === "string" && unit.trim()) {
        return { value: durationValue.trim(), unit: unit.trim() };
      }
    }
  } catch {
    // fall back to plain string
  }
  return null;
};

const formatDurationLabel = (value?: string | null) => {
  const meta = parseDurationMeta(value);
  if (meta) return `${meta.value} ${meta.unit}`;
  if (value && value.trim()) return value.trim();
  return "Duración por confirmar";
};

const buildDurationOptions = (values: (string | null)[]): DurationOption[] => {
  const map = new Map<string, string>();
  for (const value of values) {
    if (!value) continue;
    if (!map.has(value)) {
      map.set(value, formatDurationLabel(value));
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: TourSearchParams;
};

export default async function ToursGridPage({
  searchParams
}: Props & { searchParams?: TourSearchParams | Promise<TourSearchParams> }) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<TourSearchParams>).then === "function"
      ? await searchParams
      : searchParams;
  const params = resolvedSearchParams ?? {};

  const [countries, destinations, languagesRaw, durationsRaw] = await Promise.all([
    prisma.country.findMany({
      select: { name: true, slug: true }
    }),
    prisma.destination.findMany({
      select: {
        name: true,
        slug: true,
        country: { select: { slug: true } }
      }
    }),
    prisma.tour.findMany({
      where: { status: "published" },
      select: { language: true }
    }),
    prisma.tour.findMany({
      where: { status: "published" },
      select: { duration: true }
    })
  ]);

  const uniqueLanguages = Array.from(new Set(languagesRaw.map((entry) => entry.language).filter(Boolean)));
  const durationOptions = buildDurationOptions(durationsRaw.map((entry) => entry.duration));
  const durationLabelLookup = new Map(durationOptions.map((option) => [option.value, option.label]));

  const where = buildTourFilter(params);

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      departureDestination: {
        include: { country: true }
      }
    },
    take: 24
  });

  const activeFilters = [
    params.country && `País: ${params.country}`,
    params.destination && `Zona: ${params.destination}`,
    params.language && `Idioma: ${params.language}`,
    params.duration &&
      `Duración: ${durationLabelLookup.get(params.duration) ?? params.duration}`,
    params.minPrice && `Mín: $${params.minPrice}`,
    params.maxPrice && `Máx: $${params.maxPrice}`
  ].filter(Boolean);

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Proactivitis Tours</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">Explora experiencias disponibles</h1>
              <p className="mt-1 text-sm text-slate-600">Filtra por país, destino, duración, idioma o precio.</p>
            </div>
          </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <aside className="space-y-6">
            <TourFilters
              countries={countries}
            destinations={destinations.map((dest) => ({
              name: dest.name,
              slug: dest.slug,
              countrySlug: dest.country.slug
            }))}
              languages={uniqueLanguages}
              durations={durationOptions}
            />
          </aside>
          <section className="space-y-4">
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((label) => (
                  <span key={label} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Mostrando {tours.length} experiencia{tours.length === 1 ? "" : "s"} según los filtros.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <Link
                  key={tour.slug}
                  href={`/tours/${tour.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-slate-200">
                    <DynamicImage
                      src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                      alt={tour.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
            <div className="space-y-1 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {tour.departureDestination?.country?.name ?? "Global"} ·{" "}
                      {tour.departureDestination?.name ?? tour.location}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">{tour.title}</p>
                    <p className="text-xs text-slate-500">
                      Desde ${tour.price.toFixed(0)} · {formatDurationLabel(tour.duration)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {tours.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No hay tours con esos filtros. Cambia los parámetros y vuelve a intentar.
                </div>
            )}
          </section>
        </div>
      </main>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Destinos a la vista</p>
              <h2 className="text-3xl font-semibold text-slate-900">Encuentra tu zona ideal</h2>
            </div>
            <Link href="/destinations" className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900">
              Ver todos los destinos
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.country.slug}/${dest.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-500 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Desde {dest.country.slug}</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{dest.name}</h3>
                <p className="mt-1 text-sm text-slate-600">Explora tours y experiencias vinculadas a esta zona.</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600">
                  Ver tours ·
                  <span className="ml-2 text-xs uppercase tracking-[0.3em] text-slate-500">Descubre</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
