export const dynamic = "force-dynamic";

import Link from "next/link";
import { parseNotificationMetadata, getContactNotifications } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/admin/notifications/actions";
import { prisma } from "@/lib/prisma";
import { PartnerApplication } from "@prisma/client";
import { approveApplication, rejectApplication } from "@/app/(dashboard)/admin/partner-applications/actions";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

export default async function AdminCrmPage() {
  const requests = await getContactNotifications(50);
  const partnerApplications: PartnerApplication[] = await prisma.partnerApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">CRM</p>
            <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de contacto</h1>
          </div>
          <Link href="/contact" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300">
            Ver formulario público
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Aquí se registran los mensajes que envían los usuarios desde la página de contacto. Puedes marcar como leída cada
          solicitud una vez que se atiende.
        </p>
      </section>

      <section className="space-y-4">
        {requests.length ? (
          requests.map((request) => {
            const metadata = parseNotificationMetadata(request.metadata);
            const topicLabel = metadata.topic ?? "Sin tema especificado";
            return (
              <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Contacto</span>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">{topicLabel}</h2>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(request.createdAt)}</span>
                </div>
                <p className="mt-4 text-sm text-slate-600 whitespace-pre-line">{request.message}</p>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <p>
                    <span className="font-semibold text-slate-900">Nombre:</span> {metadata.name ?? "Sin nombre"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Email:</span> {metadata.email ?? "Sin email"}
                  </p>
                  {metadata.bookingCode ? (
                    <p>
                      <span className="font-semibold text-slate-900">Reserva:</span> {metadata.bookingCode}
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {request.isRead ? (
                    <span className="text-emerald-500">Leída</span>
                  ) : (
                    <form action={markNotificationReadAction} method="post" className="flex items-center gap-2">
                      <input type="hidden" name="notificationId" value={request.id} />
                      <input type="hidden" name="redirectTo" value="/admin/crm" />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                      >
                        Marcar como leída
                      </button>
                    </form>
                  )}
                  <Link
                    href="/admin/notifications"
                    className="font-semibold text-sky-600 hover:underline"
                  >
                    Ver notificaciones generales
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Aún no hay solicitudes nuevas desde el formulario de contacto.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Solicitudes de registro</p>
          <h2 className="text-2xl font-semibold text-slate-900">Suppliers y agencias</h2>
          <p className="text-sm text-slate-500">
            Aquí llegan las aplicaciones que completan los partners. Puedes aprobar o rechazar directamente desde esta
            vista o abrir el registro completo.
          </p>
        </div>
        {partnerApplications.length ? (
          <div className="space-y-4">
            {partnerApplications.map((application) => (
              <article key={application.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {application.role === "SUPPLIER" ? "Supplier" : "Agency"}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{application.companyName}</h3>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(application.createdAt).toLocaleDateString("es-ES")}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{application.description}</p>
                <div className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                  <p>
                    <span className="font-semibold text-slate-900">Contacto:</span> {application.contactName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Email:</span> {application.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Servicios:</span>{" "}
                    {(application.serviceTypes ?? "").split(",").map((service) => service.trim()).filter(Boolean).join(", ") ||
                      "No especificado"}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={approveApplication} method="POST" className="inline-flex">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 transition hover:bg-emerald-50"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectApplication} method="POST" className="inline-flex">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-rose-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 transition hover:bg-rose-50"
                    >
                      Rechazar
                    </button>
                  </form>
                  <Link href="/admin/partner-applications" className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:underline">
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Aún no hay solicitudes nuevas de registro.
          </div>
        )}
      </section>
    </div>
  );
}
