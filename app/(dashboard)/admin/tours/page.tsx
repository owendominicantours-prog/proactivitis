import { prisma } from "@/lib/prisma";
import { TourModerationConsole, SimpleTourRecord } from "@/components/admin/tours/TourModerationConsole";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    include: {
      SupplierProfile: {
        select: {
          company: true
        }
      }
    }
  });

  const statusPriority = ["under_review", "pending", "needs_changes", "draft", "paused", "published"];
  const sortedTours = [...tours].sort((a, b) => {
    const aPriority = statusPriority.indexOf(a.status);
    const bPriority = statusPriority.indexOf(b.status);
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const simplified: SimpleTourRecord[] = sortedTours.map((tour) => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    price: tour.price,
    duration: tour.duration,
    description: tour.description,
    language: tour.language,
    includes: tour.includes,
    location: tour.location,
    supplier: {
      name: tour.SupplierProfile?.company ?? "Proveedor sin nombre"
    },
    status: tour.status,
    heroImage: tour.heroImage ?? null,
    country: tour.country ?? tour.location
  }));

  return (
    <section className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Tours</h1>
      <p className="text-sm text-slate-500">
        Modera los tours creados por cada proveedor. Revisa su estado y solicita cambios cuando sea necesario.
      </p>
      <TourModerationConsole tours={simplified} />
    </section>
  );
}
