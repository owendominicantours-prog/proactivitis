import { prisma } from "@/lib/prisma";

export default async function AdminLogsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Developer / Logs</h1>
      <p className="text-sm text-slate-500">
        Historial de eventos y errores críticos para auditar tus webhooks y eventos administrativos.
      </p>
      <div className="mt-6 space-y-3">
        {notifications.map((note) => (
          <article key={note.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{note.title}</p>
            <p className="text-xs text-slate-500">{note.body}</p>
            <p className="text-xs text-slate-400">Case: {note.caseNumber ?? "N/A"}</p>
          </article>
        ))}
        {!notifications.length && <p className="text-sm text-slate-500">No hay logs recientes.</p>}
      </div>
    </section>
  );
}
