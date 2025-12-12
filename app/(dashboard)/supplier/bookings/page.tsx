export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingTable } from "@/components/bookings/BookingTable";
import {
  supplierCancelBooking,
  supplierRequestCancellation
} from "@/lib/actions/bookingCancellation";
import { requiresCancellationRequest } from "@/lib/bookings";

export default async function SupplierBookingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para ver tus reservas.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!supplier) {
    return <div className="py-10 text-center text-sm text-slate-600">Activa tu perfil de supplier para ver tus reservas.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      Tour: {
        supplierId: supplier.id
      }
    },
    include: { Tour: true },
    orderBy: { travelDate: "asc" }
  });

  const rows = bookings.map((booking) => ({
    id: booking.id,
    travelDate: booking.travelDate.toISOString().slice(0, 10),
    createdAt: booking.createdAt.toISOString().slice(0, 10),
    travelDateValue: booking.travelDate.toISOString(),
    createdAtValue: booking.createdAt.toISOString(),
    tourTitle: booking.Tour?.title ?? "",
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

  const rowActions = bookings.map((booking) => {
    const travelDate = new Date(booking.travelDate);
    const needsRequest = requiresCancellationRequest(travelDate);
    return (
      <details key={booking.id} className="space-y-2 text-xs text-slate-500">
        <summary className="cursor-pointer rounded-md border border-slate-200 px-3 py-1 text-center font-semibold text-slate-600">
          {needsRequest ? "Solicitar cancelacion" : "Cancelar reserva"}
        </summary>
        <form
          action={needsRequest ? supplierRequestCancellation : supplierCancelBooking}
          method="post"
          className="space-y-2"
        >
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Motivo de cancelacion
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
  });

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reservas</h1>
        <p className="text-sm text-slate-500">Gestion de reservas confirmadas en tus tours.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <BookingTable bookings={rows} showFields={{ showHotel: true }} rowActions={rowActions} />
      </div>
    </section>
  );
}