"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Destinos", href: "/destinos" },
  { label: "Tours", href: "/tours" },
  { label: "Ayuda", href: "/help" },
  { label: "Login", href: "/auth/login" }
];

export const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Proactivitis
        </Link>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full bg-slate-100 p-2 text-slate-600"
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
