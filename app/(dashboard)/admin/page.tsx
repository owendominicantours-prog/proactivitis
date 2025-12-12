export const dynamic = "force-dynamic"; // Dashboard must always show live KPIs.

import { format } from "date-fns";
import { getAdminDashboardMetrics } from "@/lib/dashboardStats";

const alerts = [
  { title: "Supplier con 118 días de promos", level: "Crítico", type: "supplier" },
  { title: "Reserva conflictiva en Buggy", level: "Advertencia", type: "reservas" },
  { title: "Stripe necesita verificación", level: "Urgente", type: "pagos" }
];

const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

const kpiCards = [
  { label: "Reservas confirmadas", key: "confirmedThisMonth", icon: "M4 9h1.5v7H4V9zM8 5H9.5v11H8V5zM12 1h1.5v15H12V1z" },
  { label: "Cancelaciones", key: "cancellationsThisMonth", icon: "M6 12h4v3H6z" },
  { label: "Solicitudes pendientes", key: "cancellationRequests", icon: "M6 3h6a2 2 0 0 1 2 2v5H6V3z" },
  { label: "Ingreso bruto", key: "grossRevenue", icon: "M12 14c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" }
] as const;

export default async function AdminDashboard() {
  const stats = await getAdminDashboardMetrics();

  const getValue = (key: typeof kpiCards[number]["key"]) => {
    if (key === "grossRevenue") return formatCurrency(stats.grossRevenue);
    return stats[key].toLocaleString ? stats[key].toLocaleString() : String(stats[key]);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Admin Dashboard</p>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-semibold text-slate-900">Todo está al día.</h2>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            Éxito
          </span>
        </div>
        <p className="text-sm text-slate-500">Control total sobre las operaciones de reservas y cancelaciones.</p>
        <p className="text-sm text-slate-500">Actualizado al {format(new Date(), "dd 'de' MMMM 'de' yyyy")}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d={card.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{card.label}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-indigo-600">{getValue(card.key)}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Calidad</h3>
          <p className="mt-2 text-sm text-slate-600">
            Las métricas reflejan la salud real del marketplace: reservas confirmadas, cancelaciones y solicitudes bajo control del equipo.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Cancelaciones</h3>
          <p className="mt-2 text-sm text-slate-600">
            Mantén el ritmo con el equipo operativo: todas las cancelaciones registradas cuentan con motivo y responsable.
          </p>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Resumen financiero</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comisión plataforma</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.grossRevenue * 0.1)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comisión agencia</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.grossRevenue * 0.2)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Payout estimado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.grossRevenue * 0.7)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Alertas críticas</h3>
          <button className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600">
            Ver detalles
          </button>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {alerts.map((alert) => (
            <li key={alert.title} className="flex items-center justify-between rounded-md border border-slate-100 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{alert.type}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{alert.title}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.3em] ${
                  alert.level === "Crítico"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : alert.level === "Advertencia"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-sky-200 bg-sky-50 text-sky-700"
                }`}
              >
                {alert.level}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
