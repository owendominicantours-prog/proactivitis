"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const AgencyTopbar = () => {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Agency";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <div className="flex items-center gap-3">
        <Image src="/logo/logo.png" alt="Proactivitis" width={32} height={32} className="rounded-full object-contain" />
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Agency Hub</p>
          <p className="text-lg font-semibold text-slate-900">Agencia · Proactivitis</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
        >
          Ver web pública
        </Link>
        <button className="text-sm font-semibold text-slate-600">Notificaciones</button>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <span className="text-sm text-slate-900">{role}</span>
        </div>
      </div>
    </div>
  );
};
