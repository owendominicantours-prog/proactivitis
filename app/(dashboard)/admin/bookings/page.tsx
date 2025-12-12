export const dynamic = "force-dynamic"; // Needs fresh reservation & cancellation data in every render.

import { prisma } from "@/lib/prisma";
import { BookingTable, BookingRow } from "@/components/bookings/BookingTable";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import {
  adminCancelBooking,
  adminApproveCancellation
} from "@/lib/actions/bookingCancellation";
import { formatTimeUntil } from "@/lib/bookings";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { Tour: true },
    orderBy: { createdAt: "desc" }
  });
  const cancellationRequests = bookings.filter(
    (booking) => booking.status === "CANCELLATION_REQUESTED"
  );
  const rows: BookingRow[] = bookings.map((booking) => ({
    id: booking.id,
    travelDate: booking.travelDate.toLocaleDateString("es-ES"),
    createdAt: booking.createdAt.toLocaleDateString("es-ES"),
    travelDateValue: booking.travelDate.toISOString(),
    createdAtValue: booking.createdAt.toISOString(),
    tourTitle: booking.Tour?.title ?? "Tour no disponible",
    customerName: booking.customerName,
    pax: booking.paxAdults + booking.paxChildren,
    totalAmount: booking.totalAmount,
    status: booking.status,
    source: booking.source,
    hotel: booking.hotel,
    cancellationReason: booking.cancellationReason,
    cancellationByRole: booking.cancellationByRole,
    cancellationAt: booking.cancellationAt?.toISOString() ?? null
  }));
  const rowActions = bookings.map((booking) => (
    <details key={booking.id} className="space-y-2 text-xs text-slate-500">
      <summary className="cursor-pointer rounded-md border border-slate-200 px-3 py-1 text-center font-semibold text-slate-600">
        Cancelar
      </summary>
      <form action={adminCancelBooking} method="post" className="space-y-2">
        <input type="hidden" name="bookingId" value={booking.id} />
        <textarea
          name="reason"
          required
          placeholder="Motivo de cancelación"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white"
        >
          Confirmar cancelación
        </button>
      </form>
    </details>
  ));

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500">Vista general de todas las reservas creadas en la plataforma.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <BookingTable bookings={rows} showFields={{ showHotel: true, showSource: true }} rowActions={rowActions} />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Solicitudes de cancelación</h2>
            <p className="text-sm text-slate-500">Revisa lo que solicitaron las agencias o proveedores.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Pendientes</span>
        </div>
        {cancellationRequests.length ? (
          <div className="space-y-3">
            {cancellationRequests.map((booking) => (
              <article key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{booking.tourTitle}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {booking.travelDate} · {formatTimeUntil(new Date(booking.travelDateValue))}
                    </p>
                  </div>
                  <BookingStatusBadge status="CANCELLATION_REQUESTED" />
                </div>
                <p className="text-xs text-slate-500">
                  Solicitado por {booking.cancellationByRole ?? "Proveedor"} · Motivo: {booking.cancellationReason ?? "Sin motivo"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <form action={adminApproveCancellation} method="post" className="flex">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-500 px-3 py-1 text-white hover:bg-emerald-600"
                    >
                      Aprobar cancelación
                    </button>
                  </form>
                  <form action={adminCancelBooking} method="post" className="flex">
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <textarea
                      name="reason"
                      required
                      placeholder="Motivo para mantener"
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-slate-600 px-3 py-1 text-slate-700"
                    >
                      Mantener reserva
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
            No hay solicitudes pendientes.
          </div>
        )}
      </section>
    </div>
  );
}
