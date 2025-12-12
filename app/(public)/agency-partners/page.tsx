import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Alianzas con agencias · Proactivitis"
};

export default function AgencyPartnershipPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Colabora</p>
        <h1 className="text-4xl font-semibold text-slate-900">Alianzas con agencias</h1>
        <p className="text-lg text-slate-600">
          Cuéntanos cómo trabajas y qué servicios ofreces a tus clientes. Nuestro equipo verifica información y te
          ofrece acceso al portal con herramientas para reservas, notificaciones y reportes.
        </p>
        <p className="text-sm text-slate-500">
          La revisión también contempla la documentación que compartas en este formulario. Una vez aprobada tu cuenta,
          te damos acceso al panel y al chat con tu equipo de soporte.
        </p>
        <div>
          <a
            href="#partner-form"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100"
          >
            Registrar mi agencia
          </a>
        </div>
      </div>

      <PartnerRequestForm id="partner-form" role="AGENCY" subtitle="Registra tu agencia y obtén acceso al portal" />
    </div>
  );
}
