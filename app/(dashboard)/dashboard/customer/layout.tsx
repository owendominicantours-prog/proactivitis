import { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Customer · Proactivitis"
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Proactivitis
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/dashboard/customer" className="text-slate-900">
              Mis reservas
            </Link>
            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
