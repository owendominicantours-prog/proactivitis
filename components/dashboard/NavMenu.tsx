"use client";

import Link from "next/link";
import { useState } from "react";
import type { PanelNavItem } from "./PanelShell";

type Props = {
  navItems: PanelNavItem[];
};

export function NavMenu({ navItems }: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition hover:border-slate-300"
      >
        <span className="text-lg">☰</span>
        Menú
      </button>
      {open && (
        <div className="absolute left-0 z-40 mt-2 min-w-[14rem] rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex flex-col divide-y divide-slate-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
