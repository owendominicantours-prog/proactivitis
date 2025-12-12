import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const roleLabels: Record<string, { title: string; description: string; dashboard: string }> = {
  admin: {
    title: "Admin Control Center",
    description: "Gestión total: tours, landings, reportes, CRM y alertas críticas.",
    dashboard: "/admin"
  },
  supplier: {
    title: "Supplier Studio",
    description: "Panel financiero, calendario, reservas y promociones de tus tours.",
    dashboard: "/supplier"
  },
  agency: {
    title: "Agency Hub",
    description: "Comisiones, payouts, reservas propias y mini-sitios white-label.",
    dashboard: "/agency"
  },
  customer: {
    title: "Customer Portal",
    description: "Tus reservas, tickets, historial, chat y recomendaciones en un solo lugar.",
    dashboard: "/customer"
  }
};

type Props = {
  params: Promise<{ role: string }>;
};

export default async function PortalRolePage({ params }: Props) {
  const { role = "" } = await params;
  const requestedRole = role.toLowerCase();
  const metadata = roleLabels[requestedRole];

  const session = await getServerSession(authOptions);
  const hasAccess = session?.user?.role?.toLowerCase() === requestedRole;
  const isKnown = Boolean(metadata);

  return (
    <div className="min-h-[70vh] bg-white text-slate-900">
      <section className="relative overflow-hidden rounded-b-[48px] bg-gradient-to-r from-brand to-blue-500 px-6 py-12 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-white/80">Portal exclusivo</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{metadata?.title ?? "Portal privado"}</h1>
        <p className="mt-3 max-w-2xl text-base text-white/80">
          {metadata?.description ??
            "Cada rol recibe un dashboard independiente que prioriza sus operaciones, sin el header público ni el footer común."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.4em]">
          <span className="rounded-full border border-white/40 px-4 py-2 text-white/80">CRM</span>
          <span className="rounded-full border border-white/40 px-4 py-2 text-white/80">Seguridad</span>
          <span className="rounded-full border border-white/40 px-4 py-2 text-white/80">Operaciones</span>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-6 px-6 py-12">
        {isKnown ? (
          <>
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
              <p>
                Este portal muestra una vista previa del panel donde trabajarás. Cuando estés autenticado como{" "}
                <strong className="text-slate-900">{requestedRole}</strong>, el sistema te redirige automáticamente al
                dashboard real con su sidebar, topbar y contenido clave.
              </p>
            </div>
            {hasAccess ? (
              <div className="rounded-[28px] border border-brand/30 bg-white p-6 shadow-lg">
                <p className="text-sm font-semibold text-slate-500">Ya estás logueado como {requestedRole}</p>
                <Link
                  href={metadata.dashboard}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white"
                >
                  Ir al panel
                </Link>
              </div>
            ) : (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm">
                  Inicia sesión con una cuenta que tenga rol <strong>{requestedRole}</strong> para ver el panel puesto en marcha.
                </p>
                <Link
                  href="/auth/login"
                  className="mt-4 inline-flex items-center justify-center rounded-2xl border border-brand px-6 py-3 text-sm font-semibold text-brand"
                >
                  Ir al login
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
            <p>El portal solicitado ({params.role}) no existe. Usa uno de los roles válidos: admin, supplier, agency, customer.</p>
            <Link href="/portal" className="mt-3 inline-flex text-sm font-semibold text-red-700 underline">
              Volver al listado de portales
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
