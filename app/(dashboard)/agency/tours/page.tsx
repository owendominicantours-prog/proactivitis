import { prisma } from "@/lib/prisma";
import { TourCatalog, AgencyTourSummary } from "@/components/agency/TourCatalog";

export default async function AgencyTourCatalogPage() {
  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    include: {
      supplier: {
        select: {
          company: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const simplified: AgencyTourSummary[] = tours.map((tour) => ({
    id: tour.id,
    title: tour.title,
    price: tour.price,
    location: tour.location,
    supplier: tour.supplier.company,
    heroImage: tour.heroImage ?? "/fototours/fototour.jpeg",
    destination: tour.country ?? tour.location
  }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Catálogo de tours</h1>
          <p className="text-sm text-slate-500">
            Revisa los tours publicados, calcula precios netos y prepara ventas manuales.
          </p>
        </div>
        <button className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600">
          Crear tour
        </button>
      </div>
      <TourCatalog tours={simplified} />
    </section>
  );
}
