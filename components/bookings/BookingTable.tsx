 "use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { BookingStatusBadge } from "./BookingStatusBadge";
import type { BookingStatus } from "@/lib/types/booking";

export type BookingRow = {
  id: string;
  travelDate: string;
  createdAt: string;
  travelDateValue: string;
  createdAtValue: string;
  tourTitle: string;
  customerName: string;
  pax: number;
  totalAmount: number;
  status: BookingStatus;
  source: "WEB" | "SUPPLIER" | "AGENCY";
  hotel?: string | null;
  cancellationReason?: string | null;
  cancellationByRole?: string | null;
  cancellationAt?: string | null;
};

type Props = {
  bookings: BookingRow[];
  showFields?: { showHotel?: boolean; showSource?: boolean };
  rowActions?: Record<string, ReactNode>;
};

export const BookingTable = ({ bookings, showFields, rowActions }: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        search === "" ||
        booking.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? booking.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <input
          type="text"
          placeholder="Buscar por cliente o tour"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLATION_REQUESTED">CANCELLATION_REQUESTED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-600">
          <thead className="text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Creadas</th>
              <th className="px-3 py-2 text-left">Tour</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Pax</th>
              {showFields?.showHotel && <th className="px-3 py-2 text-left">Hotel</th>}
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Estado</th>
              {showFields?.showSource && <th className="px-3 py-2 text-left">Origen</th>}
              {rowActions && <th className="px-3 py-2 text-left">Acciones</th>}
              <th className="px-3 py-2 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
          {filtered.map((booking, index) => (
              <tr key={booking.id} className="border-t border-slate-100">
                <td className="px-3 py-3 text-slate-900">{booking.travelDate}</td>
                <td className="px-3 py-3">{booking.createdAt}</td>
                <td className="px-3 py-3">{booking.tourTitle}</td>
                <td className="px-3 py-3">{booking.customerName}</td>
                <td className="px-3 py-3">{booking.pax}</td>
                {showFields?.showHotel && <td className="px-3 py-3">{booking.hotel ?? "-"}</td>}
                <td className="px-3 py-3">${booking.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-3">
                  <BookingStatusBadge status={booking.status} />
                </td>
                {showFields?.showSource && (
                  <td className="px-3 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">{booking.source}</td>
                )}
                {rowActions && <td className="px-3 py-3">{rowActions[booking.id]}</td>}
                <td className="px-3 py-3">
                  <Link href={`/supplier/bookings/${booking.id}`} className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900">
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
              {!filtered.length && (
                <tr>
                  <td
                  colSpan={
                    (showFields?.showSource ? 9 : 8) + (rowActions ? 1 : 0) + 1
                  }
                    className="px-3 py-6 text-center text-xs text-slate-400"
                  >
                    No hay reservas que coincidan.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
