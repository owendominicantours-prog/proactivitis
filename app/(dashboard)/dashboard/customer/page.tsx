export const dynamic = "force-dynamic"; // Customer portal should always reflect latest bookings.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { BookingStatus } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesión para ver tus reservas.</div>;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    include: { tour: true },
    orderBy: { travelDate: "asc" }
  });

  const today = new Date();
  const upcoming = bookings.filter((booking) => booking.travelDate >= today);
  const past = bookings.filter((booking) => booking.travelDate < today);

  const statusMessages: Record<BookingStatus, string> = {
    CONFIRMED: "Tu reserva está confirmada.",
    CANCELLATION_REQUESTED: "Se ha solicitado la cancelación de esta reserva. Nuestro equipo la revisa.",
    CANCELLED: "Esta reserva está cancelada.",
    COMPLETED: "Esta reserva fue completada."
  };

  const renderList = (items: typeof bookings) => (
    <div className="space-y-3">
      {items.map((booking) => (
        <div key={booking.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{booking.tour.title}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {booking.travelDate.toLocaleDateString("es-ES")} · {booking.travelDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {booking.status}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{statusMessages[booking.status] ?? ""}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-slate-600">
            <p>Pax: {booking.paxAdults + booking.paxChildren}</p>
            <Link href={`/dashboard/customer/reservas/${booking.id}`} className="text-xs font-semibold text-sky-500 hover:underline">
              Ver detalle
            </Link>
          </div>
        </div>
      ))}
      {!items.length && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Sin reservas en esta categoría.
        </div>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Mis reservas</h1>
        <p className="text-sm text-slate-500">Administra tus próximas experiencias y repasa las pasadas.</p>
      </div>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Próximas</h2>
          {renderList(upcoming)}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Pasadas</h2>
          {renderList(past)}
        </div>
      </div>
    </section>
  );
}
