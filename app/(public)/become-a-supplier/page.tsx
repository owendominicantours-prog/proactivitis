import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Conviértete en supplier · Proactivitis"
};

export default function BecomeSupplierPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Colabora</p>
        <h1 className="text-4xl font-semibold text-slate-900">Conviértete en supplier</h1>
        <p className="text-lg text-slate-600">
          Envíanos tu solicitud con los detalles de tu operación. Revisamos manualmente cada propuesta para asegurar la
          calidad del catálogo y te notificamos cuando el equipo apruebe tu cuenta.
        </p>
        <p className="text-sm text-slate-500">
          Completa el formulario y adjunta tu documentación comercial válida. Sabemos que tu tiempo es valioso, por eso
          respondemos en menos de 48 horas hábiles.
        </p>
        <div>
          <a
            href="#partner-form"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100"
          >
            Registrarse como supplier
          </a>
        </div>
      </div>

      <PartnerRequestForm
        id="partner-form"
        role="SUPPLIER"
        subtitle="Cuéntanos sobre tu operación y tus servicios"
      />
    </div>
  );
}
