import { StatCard } from "@/components/admin/StatCard";
import { CustomerSidebar } from "@/components/customer/Sidebar";
import { CustomerTopbar } from "@/components/customer/Topbar";

const upcomingReservations = [
  {
    date: "08 Dic",
    tour: "Saona Island Escape",
    time: "08:00 AM",
    state: "Confirmada",
    guests: "2 pax",
    pickup: "Hotel Owen Beach"
  },
  {
    date: "12 Dic",
    tour: "Buggy + Horse",
    time: "09:30 AM",
    state: "Pendiente",
    guests: "4 pax",
    pickup: "Lobby Hilton Punta Cana"
  }
];

const notifications = [
  { text: "Tu tour Saona Island fue confirmado", type: "confirmacion" },
  { text: "Nuevo mensaje de soporte: revisión de voucher", type: "mensaje" },
  { text: "Cambio de punto de encuentro para Buggy", type: "alerta" }
];

const chatThreads = [
  { title: "Soporte Proactivitis", last: "Te confirmamos tu tour Saona Island" },
  { title: "Supplier — Dominican Safari", last: "Te enviamos voucher actualizado" },
  { title: "Soporte de facturación", last: "Tu factura ya está lista" }
];

export default function CustomerPortal() {
  return (
    <div className="bg-slate-100">
      <CustomerSidebar />
      <div className="ml-0 lg:ml-56">
        <CustomerTopbar />
        <main className="space-y-6 p-6">
          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-[0.4em] text-slate-500">Resumen rápido</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Reservas próximas" value={upcomingReservations.length.toString()} />
              <StatCard label="Notificaciones" value={notifications.length.toString()} />
              <StatCard label="Chats activos" value={chatThreads.length.toString()} />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Próximas reservas</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {upcomingReservations.map((reservation) => (
                  <li key={`${reservation.tour}-${reservation.date}`} className="rounded-2xl border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">
                      {reservation.date} · {reservation.tour}
                    </p>
                    <p>
                      {reservation.time} · {reservation.state} · {reservation.guests}
                    </p>
                    <p className="text-xs text-slate-500">Pickup: {reservation.pickup}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Chat / Soporte</h3>
              <p className="mt-2 text-sm text-slate-600">Conversaciones en curso con proveedores y soporte.</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {chatThreads.map((chat) => (
                  <div key={chat.title} className="rounded-2xl border border-slate-100 p-3">
                    <p className="font-semibold text-slate-900">{chat.title}</p>
                    <p className="text-xs text-slate-400">Último mensaje · {chat.last}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Notificaciones recientes</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {notifications.map((notification) => (
                <li key={notification.text} className="rounded-2xl border border-slate-100 p-3">
                  <p className="font-semibold text-slate-900">{notification.text}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{notification.type}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
