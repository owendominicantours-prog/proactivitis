import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const updateAgencyApproval = async (formData: FormData, approved: boolean) => {
  "use server";
  const id = formData.get("agencyId");
  if (!id || typeof id !== "string") return;
  await prisma.agencyProfile.update({
    where: { id },
    data: { approved }
  });
  revalidatePath(`/admin/agencies/${id}`);
};

export async function approveAgency(formData: FormData) {
  await updateAgencyApproval(formData, true);
}

export async function rejectAgency(formData: FormData) {
  await updateAgencyApproval(formData, false);
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const agencyId = resolved?.id ?? "";
  if (!agencyId) {
    notFound();
  }

  const agency = await prisma.agencyProfile.findUnique({
    where: { id: agencyId },
    include: {
      user: true
    }
  });

  if (!agency) {
    return (
      <div className="p-10 text-slate-500">
        Agencia no encontrada.
        <div className="mt-2">
          <Link href="/admin/agencies" className="text-brand underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Detalle de agencia</p>
          <h1 className="text-2xl font-semibold text-slate-900">{agency.companyName}</h1>
          <p className="text-sm text-slate-600">{agency.user.name ?? agency.user.email}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
            agency.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {agency.approved ? "Aprobada" : "Pendiente"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
          <p className="text-sm font-semibold text-slate-900">{agency.user.email}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Creada el</p>
          <p className="text-sm font-semibold text-slate-900">{agency.user.createdAt.toLocaleDateString("es-DO")}</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Rol</p>
          <p className="text-sm font-semibold text-slate-900">{agency.user.role}</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Acciones</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <form action={approveAgency}>
              <input type="hidden" name="agencyId" value={agency.id} />
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-500"
              >
                Aprobar
              </button>
            </form>
            <form action={rejectAgency}>
              <input type="hidden" name="agencyId" value={agency.id} />
              <button
                type="submit"
                className="rounded-2xl border border-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 transition hover:bg-amber-100"
              >
                Rechazar
              </button>
            </form>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Información adicional</h2>
          <p className="mt-2 text-sm text-slate-600">
            Puedes dejar notas internas y definir qué tours pueden publicar. Revisa acreditaciones y documentos fiscales.
          </p>
        </article>
      </div>
    </section>
  );
}
