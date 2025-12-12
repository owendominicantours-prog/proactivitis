import Link from "next/link";
import { PartnerApplication } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { approveApplication, rejectApplication } from "./actions";

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-rose-100 text-rose-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
};

const formatServiceTypes = (value: string | null) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export default async function PartnerApplicationsPage() {
  const applications: PartnerApplication[] = await prisma.partnerApplication.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Solicitudes</p>
        <h1 className="text-3xl font-semibold text-slate-900">Registro de suplidores y agencias</h1>
        <p className="text-sm text-slate-500">
          Revisa la documentación enviada y aprueba o rechaza cada solicitud cuando estés listo.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 p-6">
        {applications.length === 0 ? (
          <p className="text-sm text-slate-500">No hay solicitudes pendientes.</p>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Empresa</p>
                    <p className="text-lg font-semibold text-slate-900">{application.companyName}</p>
                    <p>
                      {application.contactName} · {application.contactRole}
                    </p>
                    <p>
                      {application.email} · {application.phone} · {application.role.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`rounded-full border px-3 py-1 ${statusBadgeColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500">
                      {new Date(application.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Servicios</p>
                    <p className="text-sm text-slate-600">
                      {formatServiceTypes(application.serviceTypes).join(", ") || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">País</p>
                    <p className="text-sm text-slate-600">{application.country}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Website</p>
                    {application.website ? (
                      <Link href={application.website} className="text-xs text-sky-600 hover:underline">
                        {application.website}
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-500">No especificado</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Descripción</p>
                  <p className="text-sm text-slate-700">{application.description}</p>
                </div>

                {application.documentUrl && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Documentación</p>
                    <Link href={application.documentUrl} className="text-sm text-sky-600 hover:underline">
                      {application.documentName ?? "Ver documento"}
                    </Link>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={approveApplication}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectApplication}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                    >
                      Rechazar
                    </button>
                  </form>
                  <Link
                    href="/admin/partner-applications"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:underline"
                  >
                    Ver en registro completo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
