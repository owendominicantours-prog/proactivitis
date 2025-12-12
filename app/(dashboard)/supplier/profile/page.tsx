export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSupplierProfileAction } from "@/app/(dashboard)/supplier/profile/actions";

const sectionHeadingClass = "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500";

export default async function SupplierProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm">
        Accede a tu cuenta para ver o actualizar tu perfil de proveedor.
      </div>
    );
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { User: true }
  });

  if (!supplier) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 shadow-sm space-y-2">
        <p>No existe un perfil de proveedor vinculado a esta cuenta.</p>
        <p>Contacta al equipo de operaciones para activarlo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className={sectionHeadingClass}>Estado del perfil</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-900">{supplier.company || "Sin compañía registrada"}</p>
            <p className="text-sm text-slate-500">{supplier.approved ? "Perfil aprobado" : "Perfil pendiente"}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            <span className={`h-2 w-2 rounded-full ${supplier.approved ? "bg-emerald-500" : "bg-amber-500"}`} />
            {supplier.approved ? "Activo" : "Revisión"}
          </div>
          <div className="text-xs text-slate-500">
            Creado el{" "}
            {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString("es-ES") : "desconocido"}
          </div>
        </div>
          <p className="mt-4 text-sm text-slate-500">
            Puedes actualizar tu información de contacto y nombre comercial aquí. Si necesitas cambiar el estado de aprobación, habla con tu equipo de operaciones.
          </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <p className={sectionHeadingClass}>Cuenta</p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Nombre</span>
            <br />
            <span className="text-lg font-semibold text-slate-900">{supplier.User?.name ?? session.user?.name ?? "Sin nombre"}</span>
          </p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Correo electrónico</span>
            <br />
            <span className="text-lg font-semibold text-slate-900">{supplier.User?.email ?? session.user?.email}</span>
          </p>
          <p>
            <span className="text-sm font-semibold text-slate-600">Rol</span>
            <br />
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{session.user?.role ?? "SUPPLIER"}</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className={sectionHeadingClass}>Detalles del proveedor</p>
          <p className="mt-2 text-sm text-slate-500">
            ID: <span className="font-mono text-xs text-slate-500">{supplier.id}</span>
          </p>
          <p className="text-sm text-slate-500">
            Empresa activa: <strong>{supplier.company ?? "Sin nombre"}</strong>
          </p>
          <p className="text-sm text-slate-500">
            Aprobación: <strong>{supplier.approved ? "Verificada" : "Pendiente"}</strong>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className={sectionHeadingClass}>Actualizar información</p>
        <form action={updateSupplierProfileAction} method="post" className="mt-4 space-y-4">
          <label className="block space-y-1 text-sm text-slate-600">
            Nombre de contacto
            <input
              name="name"
              defaultValue={supplier.User?.name ?? session.user?.name ?? ""}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1 text-sm text-slate-600">
            Nombre comercial
            <input
              name="company"
              defaultValue={supplier.company ?? ""}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
            />
          </label>
          <p className="text-xs text-slate-500">
            Solo el nombre de contacto y el nombre de la compañía se sincronizan; para cambiar el rol o la aprobación escribe a soporte.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-800"
          >
            Guardar cambios
          </button>
        </form>
      </section>
    </div>
  );
}
