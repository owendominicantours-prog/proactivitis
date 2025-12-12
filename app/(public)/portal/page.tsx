import Link from "next/link";

const PORTALS = [
  {
    role: "admin",
    title: "Admin Control Center",
    description: "Gestión de tours, reportes y la plataforma en general."
  },
  {
    role: "supplier",
    title: "Supplier Studio",
    description: "Panel financiero, reservas, promociones y administración de tours."
  },
  {
    role: "agency",
    title: "Agency Hub",
    description: "Comisiones, payouts y operaciones para agencias clave."
  },
  {
    role: "customer",
    title: "Customer Portal",
    description: "Tus reservas, tickets y chat con soporte listos para usar."
  }
];

export default function PortalsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Portales dedicados</p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Selecciona tu portal</h1>
        <p className="text-base text-slate-600 sm:text-lg">
          Cada rol tiene un dashboard especializado con flujos, widgets y datos relevantes. Elige el portal que
          corresponda a tu cuenta y te dirigimos automáticamente al panel correcto.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-4xl gap-4 px-6 pb-16 md:grid-cols-2">
        {PORTALS.map((portal) => (
          <Link key={portal.role} href={`/portal/${portal.role}`} className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-slate-300 hover:shadow-lg">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Portal {portal.role}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{portal.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{portal.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Abrir portal
              <span className="h-px w-6 bg-brand transition group-hover:w-8" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
