import { prisma } from "@/lib/prisma";

export default async function AdminLandingsPage() {
  const landings = await prisma.landingPage.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Landings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Controla las páginas públicas que usan suppliers/agencias. Publica, edita contenido y habilita templates.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {landings.map((landing) => (
          <article key={landing.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Slug</p>
            <p className="text-lg font-semibold text-slate-900">{landing.slug}</p>
            <p className="text-sm text-slate-600">{landing.title}</p>
            <p className="text-xs text-slate-500">Actualizada: {landing.updatedAt.toLocaleDateString("es-DO")}</p>
          </article>
        ))}
      </div>
      {!landings.length && (
        <p className="text-sm text-slate-500">No hay landings creadas aún. Usa el builder para crear una nueva.</p>
      )}
    </section>
  );
}
