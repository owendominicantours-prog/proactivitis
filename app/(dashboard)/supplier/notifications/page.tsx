export const dynamic = "force-dynamic"; // Mostrar alertas vivas del supplier.

import Link from "next/link";
import { getNotificationsForRecipient, parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import { prisma } from "@/lib/prisma";
import { buildBookingDetailRoute } from "@/lib/bookingRoutes";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

export default async function SupplierNotificationsPage() {
  const notifications = await getNotificationsForRecipient({ role: "SUPPLIER", limit: 50 });

  const enrichedNotifications = notifications.map((notification) => {
    const metadata = parseNotificationMetadata(notification.metadata);
    const bookingId = metadata.bookingId ?? notification.bookingId ?? undefined;
    return { notification, metadata, bookingId };
  });

  const bookingIds = Array.from(
    new Set(
      enrichedNotifications
        .map((entry) => entry.bookingId)
        .filter((value): value is string => Boolean(value?.trim()))
    )
  );

  const bookings = bookingIds.length
    ? await prisma.booking.findMany({
        where: {
          id: { in: bookingIds }
        },
        include: { Tour: true }
      })
    : [];

  const bookingMap = new Map(bookings.map((booking) => [booking.id, booking]));

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notificaciones</p>
            <h1 className="text-2xl font-semibold text-slate-900">Alertas para proveedores</h1>
          </div>
          <Link
            href="/supplier/bookings"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
          >
            Ver reservas
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Estas alertas reflejan acciones recientes de reservas, cancelaciones y pagos para tu cuenta.
        </p>
      </section>

      <section className="space-y-4">
        {enrichedNotifications.length ? (
          enrichedNotifications.map(({ notification, metadata, bookingId }) => {
            const redirectUrl = metadata.referenceUrl ?? "/supplier/bookings";
            const display = getNotificationDisplayProps(notification.type ?? undefined);
            const message = notification.message ?? notification.body ?? "";
            const booking = bookingId ? bookingMap.get(bookingId) : undefined;
            const bookingDetailRoute = buildBookingDetailRoute({
              bookingId,
              metadataRole: metadata.role ?? notification.role,
              fallback: redirectUrl
            });

            const bookingSummary =
              booking &&
              (() => {
                const travelDateLabel = new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "medium"
                }).format(booking.travelDate);
                return (
                  <div className="mt-3 space-y-1 px-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{booking.Tour?.title ?? "Tour sin título"}</p>
                    <p>Cliente: {booking.customerName}</p>
                    <p>Fecha de viaje: {travelDateLabel}</p>
                    <p>Pax: {booking.paxAdults + booking.paxChildren}</p>
                    <p>Total: ${booking.totalAmount.toFixed(2)}</p>
                    <p className="uppercase tracking-[0.3em] text-[0.6rem] text-slate-500">{booking.status}</p>
                    <Link
                      href={bookingDetailRoute}
                      className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    >
                      Ver reserva completa
                    </Link>
                  </div>
                );
              })();

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
                <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  {bookingSummary ?? (
                    <Link href={redirectUrl} className="font-semibold text-sky-600 hover:underline">
                      Ver reserva relacionada
                    </Link>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!notification.isRead ? (
                      <form action={markNotificationReadAction} method="post" className="flex items-center gap-2 text-xs">
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <input type="hidden" name="redirectTo" value={bookingDetailRoute} />
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
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No tienes notificaciones nuevas.
          </div>
        )}
      </section>
    </div>
  );
}
