export const dynamic = "force-dynamic"; // Booking detail must reflect live cancellations or updates.

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { notFound } from "next/navigation";
import { DynamicImage } from "@/components/shared/DynamicImage";

export default async function CustomerBookingDetailPage({ params }: { params: Promise<{ id?: string }> }) {
  const resolved = await params;
  if (!resolved?.id) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center text-sm text-slate-600">
        Inicia sesión para ver el detalle de tu reserva.
      </div>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: resolved.id },
    include: {
      tour: {
        include: {
          supplier: true
        }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  const isOwner =
    booking.customerEmail === session.user?.email || (session.user?.id && booking.userId === session.user.id);
  if (!isOwner) {
    notFound();
  }

  const travelDate = booking.travelDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const travelTime = booking.travelDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const statusMessages: Record<string, string> = {
    CONFIRMED: "Tu reserva está confirmada.",
    CANCELLATION_REQUESTED: "Estamos revisando la cancelación solicitada.",
    CANCELLED: "La reserva fue cancelada.",
    COMPLETED: "Tu experiencia ya fue completada."
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Reserva {booking.id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-sm text-slate-500">Todo lo que necesitas para tu tour está aquí.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 lg:w-1/3">
            <DynamicImage
              src={booking.tour.heroImage ?? "/fototours/fototour.jpeg"}
              alt={booking.tour.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">{booking.tour.title}</h2>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-500">{statusMessages[booking.status] ?? ""}</p>
            <p className="text-sm text-slate-500">
              {travelDate} · {travelTime} · {booking.tour.location}
            </p>
            <p className="text-sm text-slate-500">Proveedor: {booking.tour.supplier.company}</p>
            <p className="text-sm text-slate-500">Pax: {booking.paxAdults + booking.paxChildren}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`#ticket`}
                className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Ver ticket
              </Link>
              <button className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                Contactar soporte
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total pagado</p>
            <p className="text-xl font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel / pickup</p>
            <p className="text-sm text-slate-700">{booking.hotel ?? "No aplica"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Información del cliente</p>
          <p className="text-base font-semibold text-slate-900">{booking.customerName}</p>
          <p>{booking.customerEmail}</p>
          {booking.customerPhone && <p>{booking.customerPhone}</p>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Detalles del tour</p>
          <p className="text-sm text-slate-700">{booking.tour.duration}</p>
          <p className="text-sm text-slate-700">{booking.tour.language}</p>
          <p className="text-sm text-slate-700">{booking.tour.includes}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notas de recogida</p>
          <p>{booking.pickupNotes ?? "Sin instrucciones adicionales"}</p>
        </article>
      </div>

      <div id="ticket" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Voucher digital</h3>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Código</p>
          <p className="text-xl font-semibold text-slate-900">{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <p>Presenta este código y muestra tu confirmación al proveedor o guía.</p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          QR en construcción · lo tendrás en la próxima versión
        </div>
      </div>
    </section>
  );
}
