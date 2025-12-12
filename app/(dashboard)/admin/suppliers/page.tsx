import { prisma } from "@/lib/prisma";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplierProfile.findMany({
    include: {
      Tour: true,
      User: true
    },
    orderBy: { company: "asc" }
  });

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Suplidores</h1>
        <p className="text-sm text-slate-500">
          Monitorea estados de aprobación, cantidad de tours y su actividad financiera.
        </p>
      </div>
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <article key={supplier.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{supplier.company}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {supplier.User?.name ?? supplier.User?.email}
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                {supplier.approved ? "Aprobado" : "Pendiente"}
              </span>
            </div>
                <p className="mt-2 text-sm text-slate-600">{supplier.Tour.length} tours publicados</p>
          </article>
        ))}
        {!suppliers.length && (
          <p className="text-sm text-slate-500">Todavía no hay suppliers registrados.</p>
        )}
      </div>
    </section>
  );
}
