export const dynamic = "force-dynamic"; // Notifications must be live.

import Link from "next/link";
import { getNotificationsForRecipient, parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/admin/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

export default async function AdminNotificationsPage() {
  const notifications = await getNotificationsForRecipient({ role: "ADMIN", limit: 50 });

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notificaciones</p>
            <h1 className="text-2xl font-semibold text-slate-900">Alertas de cancelación</h1>
          </div>
          <Link href="/admin/bookings" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300">
            Ver reservas
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Aquí puedes administrar y marcar como leídas las notificaciones del equipo, con detalles reales del tour y el booking asociado.
        </p>
      </section>

      <section className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => {
            const metadata = parseNotificationMetadata(notification.metadata);
            const redirectUrl = metadata.referenceUrl ?? "/admin/bookings";
            const display = getNotificationDisplayProps(notification.type ?? undefined);
            const message = notification.message ?? notification.body ?? "";
            return (
              <article key={notification.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{display.icon}</span>
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${display.badgeClass}`}
                      >
                        {display.label}
                      </span>
                      <h2 className="mt-2 text-lg font-semibold text-slate-900">{notification.title}</h2>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                </div>
                <p className="mt-4 text-sm text-slate-600">{message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <Link href={redirectUrl} className="font-semibold text-sky-600 hover:underline">
                    Ver reserva relacionada
                  </Link>
                  {!notification.isRead ? (
                    <form action={markNotificationReadAction} method="post" className="flex items-center gap-2">
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <input type="hidden" name="redirectTo" value={redirectUrl} />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                      >
                        Marcar como leída
                      </button>
                    </form>
                  ) : (
                    <span className="text-emerald-500">Leída</span>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No hay notificaciones nuevas.
          </div>
        )}
      </section>
    </div>
  );
}
