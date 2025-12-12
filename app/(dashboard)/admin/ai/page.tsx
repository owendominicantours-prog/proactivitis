import { prisma } from "@/lib/prisma";

export default async function AdminAiToolsPage() {
  const generateableTours = await prisma.tour.count({
    where: { featured: true }
  });
  const pendingBookings = await prisma.booking.count({
    where: { status: "pending" }
  });

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">IA Tools</h1>
        <p className="text-sm text-slate-500">
          Automatiza la generación de tours y la optimización de precios mediante IA.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tours listos</p>
          <p className="text-2xl font-semibold text-slate-900">{generateableTours}</p>
          <p className="text-sm text-slate-500">Tours destacados con IA recomendada.</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas pendientes</p>
          <p className="text-2xl font-semibold text-slate-900">{pendingBookings}</p>
          <p className="text-sm text-slate-500">Revisa las colas automáticas antes del cierre.</p>
        </article>
      </div>
    </section>
  );
}
