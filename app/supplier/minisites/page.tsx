import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SupplierMinisitesPage() {
  await requireSession();

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      location: true
    },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mini-sitios</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Tus mini-sitios públicos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Comunica tus tours más importantes con páginas reducidas preparadas para compartir.
          Selecciona un tour para copiar el enlace o abrirlo en una nueva pestaña.
        </p>
      </header>
      <section className="space-y-4">
        {tours.map((tour) => (
          <article
            key={tour.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tour.location}</p>
              <h2 className="text-lg font-semibold text-slate-900">{tour.title}</h2>
            </div>
            <Link
              href={`/tours/${tour.slug}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-400"
            >
              Abrir mini-sitio
            </Link>
          </article>
        ))}
        {tours.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No hay tours publicados para mostrar. Publica alguno desde el panel de tours.
          </div>
        )}
      </section>
    </main>
  );
}
