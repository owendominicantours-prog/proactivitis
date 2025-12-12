"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export const CustomerTopbar = () => {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Cliente";

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <div className="flex items-center gap-3">
        <Image src="/logo/logo.png" alt="Proactivitis" width={32} height={32} className="rounded-full object-contain" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Hola, Traveler</p>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Customer Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Notificaciones</button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-900">{role}</span>
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
