"use client";

import Link from "next/link";

type Props = {
  nombreProveedor: string;
  telefono?: string | null;
  reservaId: string;
};

export default function ContactoProveedor({ nombreProveedor, telefono, reservaId }: Props) {
  if (!telefono) {
    return (
      <div className="rounded-2xl bg-white/90 px-4 py-3 text-xs text-slate-500 border border-slate-200">
        No hay teléfono registrado para este proveedor.
      </div>
    );
  }

  const texto = encodeURIComponent(
    `Hola ${nombreProveedor}, soy el cliente con reserva ${reservaId}. Necesito ayuda.`
  );
  const waLink = `https://wa.me/${telefono.replace(/\D/g, "")}?text=${texto}`;

  return (
    <Link
      href={waLink}
      target="_blank"
      rel="noreferrer noopener"
      className="block rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition"
    >
      💬 Iniciar chat con {nombreProveedor}
    </Link>
  );
}
