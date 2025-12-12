import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DestinationsPage() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
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

  const countriesWithTours = countries
    .map((country) => ({
      ...country,
      tourCount: country.destinations.reduce((acc, dest) => acc + dest.tours.length, 0)
    }))
    .filter((country) => country.tourCount > 0);

  return (
    <div className="bg-slate-50 pb-16">
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Destinos</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">Dónde opera Proactivitis</h1>
          <p className="text-sm text-slate-600">
            Descubre los países con tours confirmados, sus zonas esenciales y lo más destacado en cada región. Todo lo que necesitas para
            inspirarte y planear tu viaje.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {countriesWithTours.map((country) => (
            <Link
              key={country.slug}
              href={`/destinations/${country.slug}`}
              className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{country.code ?? "Global"}</p>
                <h2 className="text-2xl font-semibold text-slate-900">{country.name}</h2>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {country.shortDescription ??
                    `Explora tours entre playas, ciudades coloniales y experiencias inmersivas en ${country.name}.`}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <span>{country.tourCount} tours activos</span>
                <span className="text-sky-500 group-hover:text-sky-600">Ver región</span>
              </div>
            </Link>
          ))}
        </div>

        {countriesWithTours.length === 0 && (
          <p className="text-sm text-slate-500">Estamos expandiendo destinos. Vuelve pronto para ver nuevas regiones.</p>
        )}
      </main>
    </div>
  );
}
