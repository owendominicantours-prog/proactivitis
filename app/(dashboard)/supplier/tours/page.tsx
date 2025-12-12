import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ToursList, SupplierTourSummary } from "@/components/supplier/ToursList";

type SupplierToursPageProps = {
  searchParams?: {
    status?: string;
  };
};

export default async function SupplierToursPage({ searchParams }: SupplierToursPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para ver tus tours.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: {
      Tour: {
        orderBy: { createdAt: "desc" },
        include: {
          departureDestination: true
        }
      }
    }
  });

  if (!supplier) {
    return (
      <div className="py-10 text-center text-sm text-slate-600">
        No hay un perfil de supplier asociado a esta cuenta.
      </div>
    );
  }

  const simplified: SupplierTourSummary[] = (supplier.Tour ?? []).map((tour) => ({
    id: tour.id,
    title: tour.title,
    price: tour.price,
    productId: tour.productId,
    location: tour.location,
    status: tour.status as SupplierTourSummary["status"],
    rating: 4.8,
    heroImage: tour.heroImage ?? "/fototours/fototour.jpeg",
    destination: tour.departureDestination?.name ?? tour.location,
    slug: tour.slug,
    duration: tour.duration,
    description: tour.description,
    language: tour.language,
    includes: tour.includes,
    platformSharePercent: tour.platformSharePercent
  }));

  return (
    <section className="space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      {searchParams?.status === "sent" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          Su tour ha sido enviado correctamente y está en revisión.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mis tours</h1>
          <p className="text-sm text-slate-500">Lista clara tipo Viator de todos tus productos activos.</p>
        </div>
        <a
          href="/supplier/tours/create"
          className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Crear tour
        </a>
      </div>
      <ToursList tours={simplified} />
    </section>
  );
}
