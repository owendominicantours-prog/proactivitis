'use client';

import { signOut, useSession } from "next-auth/react";

export function DashboardUserMenu() {
  const { data: session, status } = useSession();
  const userLabel = session?.user?.name || session?.user?.email || "Usuario";
  const initials = userLabel
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  if (status === "loading") {
    return <span className="text-xs text-slate-500">Cargando...</span>;
  }

  if (!session) {
    return null;
  }

  return (
    <details className="relative">
      <summary className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[0.7rem] font-semibold text-white">
          {initials}
        </span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="p-3 text-xs">
          <p className="font-semibold text-slate-800">{userLabel}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 w-full rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </details>
  );
}
