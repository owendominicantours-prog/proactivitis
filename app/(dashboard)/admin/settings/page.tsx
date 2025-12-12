import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const landingCount = await prisma.landingPage.count();
  const tourCount = await prisma.tour.count();
  const userCount = await prisma.user.count();

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500">
          Configuración global: branding, integraciones y reglas de disponibilidad.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Landings activas</p>
          <p className="text-2xl font-semibold text-slate-900">{landingCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tours registrados</p>
          <p className="text-2xl font-semibold text-slate-900">{tourCount}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usuarios totales</p>
          <p className="text-2xl font-semibold text-slate-900">{userCount}</p>
        </article>
      </div>
    </section>
  );
}
