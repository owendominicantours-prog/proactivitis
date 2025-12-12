"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export function PublicAuthButtons() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || session?.user?.email;
  const showPortalButton = session && (pathname === "/" || pathname === "/home");

  if (status === "loading") {
    return <div className="text-sm text-slate-500">Cargando...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {showPortalButton ? (
          <Link
            href="/portal"
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Ir al portal
          </Link>
        ) : (
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            Conectado
          </div>
        )}
        {userName && <span className="text-sm font-semibold text-slate-800">{userName}</span>}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
    >
      Sign in
    </button>
  );
}
