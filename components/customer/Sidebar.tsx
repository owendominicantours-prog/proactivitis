import Link from "next/link";

const menu = [
  { label: "Dashboard", href: "/customer" },
  { label: "Mis Reservas", href: "/customer/reservations" },
  { label: "Tickets", href: "/customer/tickets" },
  { label: "Favoritos", href: "/customer/favorites" },
  { label: "Perfil", href: "/customer/profile" },
  { label: "Pagos / Facturación", href: "/customer/payments" },
  { label: "Preferencias", href: "/customer/preferences" },
  { label: "Cerrar sesión", href: "/auth/logout" }
];

export const CustomerSidebar = () => (
  <aside className="fixed left-0 top-0 hidden h-screen w-56 flex-col bg-white px-4 py-6 text-sm text-slate-700 shadow-xl lg:flex">
    <div className="mb-8 text-xs uppercase tracking-[0.4em] text-slate-400">Traveler</div>
    <div className="space-y-2">
      {menu.map((item) => (
        <Link key={item.label} href={item.href} className="block rounded-2xl px-3 py-2 transition hover:bg-slate-100">
          {item.label}
        </Link>
      ))}
    </div>
  </aside>
);
