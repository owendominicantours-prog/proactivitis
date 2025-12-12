import { prisma } from "@/lib/prisma";

export default async function AdminFinancePage() {
  let aggregates;
  try {
    aggregates = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
        platformFee: true,
        supplierAmount: true,
        agencyFee: true
      }
    });
  } catch (error) {
    console.error("Finance aggregate error:", error);
    aggregates = {
      _sum: {
        totalAmount: 0,
        platformFee: 0,
        supplierAmount: 0,
        agencyFee: 0
      }
    };
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Finanzas</h1>
      <p className="text-sm text-slate-500">
        Ventas totales, comisiones de plataforma/agency y montos netos de suppliers.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ventas totales</p>
          <p className="text-2xl font-semibold text-slate-900">${(aggregates._sum.totalAmount ?? 0).toFixed(0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comisión plataforma</p>
          <p className="text-2xl font-semibold text-slate-900">${(aggregates._sum.platformFee ?? 0).toFixed(0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comisión agencia</p>
          <p className="text-2xl font-semibold text-slate-900">${(aggregates._sum.agencyFee ?? 0).toFixed(0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">NETO a proveedores</p>
          <p className="text-2xl font-semibold text-slate-900">${(aggregates._sum.supplierAmount ?? 0).toFixed(0)}</p>
        </article>
      </div>
    </section>
  );
}
