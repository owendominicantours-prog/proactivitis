import Link from "next/link";

const menu = [
  { label: "Dashboard", href: "/agency" },
  { label: "Tours / Catálogo", href: "/agency/tours" },
  { label: "Reservas", href: "/agency/bookings" },
  { label: "Calendario", href: "/agency/calendar" },
  { label: "Comisiones", href: "/agency/commissions" },
  { label: "Reportes", href: "/agency/reports" },
  { label: "Sub-agentes", href: "/agency/agents" },
  { label: "Mini-sitio", href: "/agency/minisite" },
  { label: "Promocodes", href: "/agency/promocodes" },
  { label: "Notificaciones", href: "/agency/notifications" },
  { label: "Perfil & Configuración", href: "/agency/profile" }
];

export const AgencySidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/95 p-6 text-white shadow-xl">
    <div className="mb-10 text-sm uppercase tracking-[0.4em] text-slate-400">Agency HQ</div>
    <nav className="space-y-2 text-sm">
      {menu.map((item) => (
        <Link key={item.label} href={item.href} className="block rounded-2xl px-4 py-2 transition hover:bg-slate-800">
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);
