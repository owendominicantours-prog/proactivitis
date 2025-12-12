import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ZoneSelector } from "@/components/public/ZoneSelector";
import { getZoneInfo } from "@/lib/destinationInfo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ countrySlug?: string }>;
};

export default async function CountryPage({ params }: Props) {
  const resolved = await params;
  const slug = resolved?.countrySlug ?? "";
  if (!slug) {
    notFound();
  }

  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      destinations: {
        include: {
          tours: {
            where: { status: "published" },
            select: { id: true }
          }
        }
      }
    }
  });

  if (!country) {
    notFound();
  }

  const enrichedDestinations = country.destinations.map((destination) => ({
    ...destination,
    zoneInfo: getZoneInfo(country.slug, destination.slug)
  }));

  return (
    <div className="bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Destinos · {country.name}</p>
          <h1 className="text-4xl font-semibold text-slate-900">{country.name}</h1>
          <p className="text-sm text-slate-600">
            {country.shortDescription || `Explora las zonas más representativas de ${country.name} y elige la que te inspire para tu siguiente aventura.`}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Selecciona una zona</h2>
              <p className="text-sm text-slate-500">
                Navega por las zonas del país y descubre su información turística junto a los tours disponibles.
              </p>
            </div>
            <div className="md:w-1/3">
              <ZoneSelector
                current=""
                zones={country.destinations.map((dest) => ({
                  name: dest.name,
                  slug: dest.slug,
                  countrySlug: country.slug
                }))}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrichedDestinations.map((destination) => (
            <article
              key={destination.slug}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Zona</p>
                <h3 className="text-2xl font-semibold text-slate-900">{destination.name}</h3>
              </div>
              <p className="text-sm text-slate-600">
                {destination.zoneInfo?.summary ?? "Una zona con tours auténticos y guías locales expertos."}
              </p>
              <div className="grid gap-2 text-xs uppercase tracking-[0.25em] text-slate-500">
                <span>{destination.tours.length} tours activos</span>
                {destination.zoneInfo && <span>{destination.zoneInfo.practical.bestSeason}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between">
                <Link
                  href={`/destinations/${country.slug}/${destination.slug}`}
                  className="text-sm font-semibold text-sky-600 hover:text-sky-500"
                >
                  Ver zona
                </Link>
                <span className="text-xs text-slate-400">{country.code ?? ""}</span>
              </div>
            </article>
          ))}
        </section>

        {enrichedDestinations.length === 0 && (
          <p className="text-sm text-slate-500">
            Por el momento no hay zonas publicadas en este país. Volveremos pronto con nuevas experiencias.
          </p>
        )}
      </main>
    </div>
  );
}
