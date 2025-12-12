export const dynamic = "force-dynamic"; // Agency bookings panel must display latest cancellations.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PanelShell } from "@/components/dashboard/PanelShell";
import { BookingTable } from "@/components/bookings/BookingTable";
import { ReactNode } from "react";
import {
  agencyCancelBooking,
  agencyRequestCancellation
} from "@/lib/actions/bookingCancellation";
import { requiresCancellationRequest } from "@/lib/bookings";
import { BookingSourceEnum, BookingStatusEnum, type BookingSource, type BookingStatus } from "@/lib/types/booking";

export default async function AgencyBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tus reservas.</div>;
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return <div className="py-10 text-center text-sm text-slate-600">No se encontró tu cuenta.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: { source: "AGENCY" },
    include: { Tour: true },
    orderBy: { createdAt: "desc" }
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const bookingsThisMonth = bookings.filter(
    (booking) => booking.createdAt >= monthStart
  );

  const totalCommission = bookingsThisMonth.reduce((sum, booking) => sum + booking.totalAmount * 0.2, 0);

  const normalizeStatus = (status: string): BookingStatus => {
    const values = Object.values(BookingStatusEnum);
    return (values.includes(status as BookingStatus) ? (status as BookingStatus) : BookingStatusEnum.CONFIRMED);
  };

  const normalizeSource = (source: string): BookingSource => {
    const values = Object.values(BookingSourceEnum);
    return (values.includes(source as BookingSource) ? (source as BookingSource) : BookingSourceEnum.AGENCY);
  };

  const rows = bookings.map((booking) => ({
    id: booking.id,
    travelDate: booking.travelDate.toLocaleDateString("es-ES"),
    createdAt: booking.createdAt.toLocaleDateString("es-ES"),
    travelDateValue: booking.travelDate.toISOString(),
    createdAtValue: booking.createdAt.toISOString(),
    tourTitle: booking.Tour?.title ?? "Tour no disponible",
    customerName: booking.customerName,
    pax: booking.paxAdults + booking.paxChildren,
    totalAmount: booking.totalAmount,
    status: normalizeStatus(booking.status),
    source: normalizeSource(booking.source),
    hotel: booking.hotel,
    cancellationReason: booking.cancellationReason,
    cancellationByRole: booking.cancellationByRole,
    cancellationAt: booking.cancellationAt?.toISOString() ?? null
  }));

  const rowActions = bookings.reduce<Record<string, ReactNode>>((acc, booking) => {
    const travelDate = new Date(booking.travelDate);
    const needsRequest = requiresCancellationRequest(travelDate);
    acc[booking.id] = (
      <details className="space-y-2 text-xs text-slate-500">
        <summary className="cursor-pointer rounded-md border border-slate-200 px-3 py-1 text-center font-semibold text-slate-600">
          {needsRequest ? "Solicitar cancelación" : "Cancelar reserva"}
        </summary>
        <form
          action={needsRequest ? agencyRequestCancellation : agencyCancelBooking}
          method="post"
          className="space-y-2"
        >
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Motivo de cancelación
            <textarea
              name="reason"
              required
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-700"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white"
          >
            {needsRequest ? "Enviar solicitud" : "Cancelar ahora"}
          </button>
        </form>
      </details>
    );
    return acc;
  }, {});

  return (
    <PanelShell roleLabel="Agency" title="Reservas" navItems={[{ label: "Reservas", href: "/agency/bookings" }]}>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500">Reservas que provienen de tu agencia.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reservas este mes</p>
            <p className="text-2xl font-semibold text-indigo-600">{bookingsThisMonth.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Comisión estimada</p>
            <p className="text-2xl font-semibold text-indigo-600">${totalCommission.toFixed(2)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <BookingTable bookings={rows} showFields={{ showHotel: true }} rowActions={rowActions} />
        </div>
      </section>
    </PanelShell>
  );
}
