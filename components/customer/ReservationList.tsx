"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CustomerReservation = {
  id: string;
  tour: string;
  date: string;
  time: string;
  status: "Confirmada" | "Pendiente" | "Cancelada";
  pickup: string;
  pax: number;
};

const sample: CustomerReservation[] = [
  {
    id: "res-001",
    tour: "Safari Dominicano desde Punta Cana",
    date: "10 Dic 2025",
    time: "08:00 AM",
    status: "Confirmada",
    pickup: "Hotel Caribe Deluxe",
    pax: 2
  },
  {
    id: "res-002",
    tour: "Avistamiento de ballenas en Samaná",
    date: "18 Dic 2025",
    time: "06:00 AM",
    status: "Pendiente",
    pickup: "Lobby Hotel Barceló",
    pax: 3
  },
  {
    id: "res-003",
    tour: "Tour gastronómico por Bogotá",
    date: "01 Ene 2025",
    time: "12:00 PM",
    status: "Confirmada",
    pickup: "Aeropuerto El Dorado",
    pax: 1
  }
];

export const ReservationList = () => {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = useMemo(() => {
    if (tab === "upcoming") {
      return sample.filter((res) => res.status !== "Cancelada");
    }
    return sample;
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "upcoming" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
          }`}
          onClick={() => setTab("upcoming")}
        >
          Próximas
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "past" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200"
          }`}
          onClick={() => setTab("past")}
        >
          Pasadas
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((reservation) => (
          <div key={reservation.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{reservation.tour}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {reservation.date} · {reservation.time}
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {reservation.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-slate-600">
              <p>Pax: {reservation.pax} · Pickup: {reservation.pickup}</p>
              <Link
                href={`/dashboard/customer/reservas/${reservation.id}`}
                className="text-xs font-semibold text-sky-500 hover:underline"
              >
                Ver detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
