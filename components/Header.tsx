"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b border-slate-200 bg-white/70 shadow-sm sticky top-0 z-50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo/logo.png" alt="Proactivitis logo" width={140} height={40} className="object-contain" />
            <div className="hidden flex-col text-xs uppercase tracking-[0.3em] text-slate-400 lg:flex">
              <span>Marketplace</span>
              <span>SaaS turístico</span>
            </div>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
          <Link href="/">Home</Link>
          <Link href="/tours">Tours</Link>
          <Link href="/destinos">Destinos</Link>
          <Link href="/landing/sample">Landings</Link>
          <Link href="/portal">Portales</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Hola, {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/register"
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
              >
                Registrarse
              </Link>
              <Link
                href="/auth/login"
                className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-brand/50 transition hover:bg-brand-light"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
