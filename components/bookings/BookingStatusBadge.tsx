"use client";

import type { BookingStatus } from "@/lib/types/booking";

const statusMap: Record<BookingStatus, { label: string; classes: string }> = {
  CONFIRMED: { label: "Confirmada", classes: "border border-emerald-200 bg-emerald-50 text-emerald-700" },
  CANCELLATION_REQUESTED: {
    label: "Solicitud de cancelación",
    classes: "border border-amber-200 bg-amber-50 text-amber-700"
  },
  CANCELLED: { label: "Cancelada", classes: "border border-rose-200 bg-rose-50 text-rose-700" },
  COMPLETED: { label: "Completada", classes: "border border-slate-200 bg-slate-50 text-slate-700" }
};

export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
  const { label, classes } = statusMap[status] ?? {
    label: status,
    classes: "border border-slate-200 bg-slate-50 text-slate-700"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
};
