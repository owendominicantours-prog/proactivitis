import { prisma } from "@/lib/prisma";

export default async function AdminAlertsPage() {
  const alerts = await prisma.booking.findMany({
    where: {
      status: { in: ["pending", "conflict"] }
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      tour: { select: { title: true } }
    }
  });

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Alertas</h1>
      <p className="text-sm text-slate-500">
        Notificaciones automáticas: reservas pendientes de pago, conflictos o proveedores sin validación.
      </p>
      <div className="mt-6 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{alert.tour.title}</p>
            <p className="text-xs text-slate-500">Estado: {alert.status}</p>
            <p className="text-xs text-slate-500">
              Fecha: {alert.date.toLocaleDateString("es-DO")} · Pax: {alert.passengers}
            </p>
          </div>
        ))}
        {!alerts.length && <p className="text-sm text-slate-500">Sin alertas críticas por el momento.</p>}
      </div>
    </section>
  );
}
