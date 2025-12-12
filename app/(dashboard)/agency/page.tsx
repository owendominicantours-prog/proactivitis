export const dynamic = "force-dynamic"; // Agency dashboard shows live metrics and must not cache.

import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAgencyDashboardMetrics } from "@/lib/dashboardStats";

const kpiCards = [
  { label: "Reservas activas", key: "activeBookings", icon: "M4 9h1.5v7H4V9zM8 5H9.5v11H8V5zM12 1h1.5v15H12V1z" },
  { label: "Cancelaciones este mes", key: "cancellationsThisMonth", icon: "M6 12h4v3H6z" },
  { label: "Comisión estimada", key: "estimatedCommission", icon: "M6 3h6a2 2 0 0 1 2 2v5H6V3z" },
  { label: "Solicitudes pendientes", key: "cancellationRequests", icon: "M4 9h1.5v7H4V9z" }
] as const;

const quickActions = ["Vender tour ahora", "Copiar enlace mini-sitio", "Ver reservas", "Exportar reportes"];

const formatCurrency = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export default async function AgencyPanel() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tu panel.</div>;
  }

  const metrics = await getAgencyDashboardMetrics(userId);
  if (!metrics) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-600">
        No tenemos datos de agencia para esta cuenta. Contacta al equipo para enlazar tu perfil.
      </div>
    );
  }

  const getValue = (key: typeof kpiCards[number]["key"]) =>
    key === "estimatedCommission" ? formatCurrency(metrics.estimatedCommission) : metrics[key].toLocaleString();

  return (
    <>
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Agency Dashboard</p>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-slate-900">
            Operaciones limpias
            <span className="ml-3 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
              Estable
            </span>
          </h2>
          <p className="text-sm text-slate-500">Las métricas se basan en tus reservas y solicitudes reales.</p>
        </div>
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

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Reservas</p>
          <p className="mt-2 text-sm text-slate-600">
            {metrics.activeBookings} reservas activas este mes. El equipo contable puede revisar los pagos pendientes.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Comisión estimada</p>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">{formatCurrency(metrics.estimatedCommission)}</p>
          <p className="text-xs text-slate-500">20% de las reservas confirmadas y completadas del mes.</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Accesos rápidos</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {quickActions.map((label) => (
              <button
                key={label}
                className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
              >
                {label}
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Alertas críticas</h3>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Status</span>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {metrics.cancellationRequests ? (
            <li className="rounded-md border border-slate-100 px-4 py-3 text-sm text-slate-700">
              {metrics.cancellationRequests} solicitudes de cancelación en revisión.
            </li>
          ) : (
            <li className="rounded-md border border-slate-100 px-4 py-3 text-xs text-slate-400">
              Lista limpia. No hay solicitudes de cancelación pendientes.
            </li>
          )}
        </ul>
      </section>
    </>
  );
}
