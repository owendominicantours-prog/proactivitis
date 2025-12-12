import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminAgenciesPage() {
  const agencies = await prisma.agencyProfile.findMany({
    include: {
      User: true
    },
    orderBy: { companyName: "asc" }
  });

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Agencias</h1>
        <p className="text-sm text-slate-500">
          Controla sub-agencias, comisiones y accesos a mini-sitios.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {agencies.map((agency) => (
          <article key={agency.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-lg font-semibold text-slate-900">{agency.companyName}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {agency.User?.name ?? agency.User?.email}
            </p>
            <p className="text-sm text-slate-600">Gestiona comisiones y promociones específicas.</p>
            <div className="mt-2">
              <Link
                href={`/admin/agencies/${agency.id}`}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-brand"
              >
                Ver detalle
              </Link>
            </div>
          </article>
        ))}
        {!agencies.length && (
          <p className="text-sm text-slate-500">No hay agencias conectadas aun.</p>
        )}
      </div>
    </section>
  );
}
