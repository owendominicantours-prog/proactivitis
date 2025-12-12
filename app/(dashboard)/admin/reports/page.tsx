import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
  const topTours = await prisma.tour.findMany({
    take: 5,
    orderBy: {
      Booking: { _count: "desc" }
    },
    include: {
      _count: {
        select: { Booking: true }
      }
    }
  });

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const bookingsByDestination = await prisma.booking.groupBy({
    by: ["tourId"],
    where: {
      travelDate: { gte: last30Days }
    },
    _count: { id: true },
    orderBy: {
      _count: { id: "desc" }
    },
    take: 5
  });

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-500">Descarga reportes CSV y visualiza tendencias por tour y destino.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Top tours</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {topTours.map((tour) => (
              <li key={tour.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-none">
                <span>{tour.title}</span>
                <span className="text-xs font-semibold text-brand">{tour._count.Booking} ventas</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Reservas 30 días</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {bookingsByDestination.map((booking) => (
              <li key={booking.tourId} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-none">
                <span>Tour ID {booking.tourId}</span>
                <span className="text-xs font-semibold text-brand">{booking._count.id} reservas</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
