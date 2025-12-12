"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { approveTour, requestChanges } from "@/lib/actions/tourModeration";

type TourRecord = {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  language: string;
  includes: string;
  location: string;
  status: string;
  featured: boolean;
  adminNote?: string | null;
  createdAt: string;
  supplier: {
    id: string;
    company: string;
    user: { id: string; name?: string | null; email: string };
  };
};

const statusLabels: Record<string, { text: string; color: string }> = {
  draft: { text: "Draft", color: "bg-slate-100 text-slate-600" },
  under_review: { text: "En revisión", color: "bg-amber-100 text-amber-700" },
  pending: { text: "Pendiente", color: "bg-amber-100 text-amber-700" },
  needs_changes: { text: "Necesita cambios", color: "bg-amber-100 text-amber-800" },
  published: { text: "Publicado", color: "bg-emerald-100 text-emerald-800" },
  paused: { text: "Pausado", color: "bg-slate-200 text-slate-700" }
};

const statusOptions = Object.keys(statusLabels);

type Props = {
  tours: TourRecord[];
};

export const TourModerationPanel = ({ tours }: Props) => {
  const [selectedId, setSelectedId] = useState<string>(tours[0]?.id ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [requestTourId, setRequestTourId] = useState<string | null>(null);

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setRequestTourId(null);
    setRequestNote("");
  };

  const suppliers = useMemo(
    () => Array.from(new Set(tours.map((tour) => tour.supplier.company))),
    [tours]
  );

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesStatus = statusFilter ? tour.status === statusFilter : true;
      const matchesSupplier = supplierFilter ? tour.supplier.company === supplierFilter : true;
      const matchesSearch = searchQuery
        ? tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesDate = dateFilter ? tour.createdAt.startsWith(dateFilter) : true;
      return matchesStatus && matchesSupplier && matchesSearch && matchesDate;
    });
  }, [tours, statusFilter, supplierFilter, searchQuery, dateFilter]);

  const fallbackId = filteredTours[0]?.id ?? "";
  const activeId = filteredTours.some((tour) => tour.id === selectedId) ? selectedId : fallbackId;
  const selectedTour = useMemo(
    () => filteredTours.find((tour) => tour.id === activeId),
    [filteredTours, activeId]
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <div className="space-y-4">
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
            <span>Lista de tours</span>
            <span>{filteredTours.length} resultados</span>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <select
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]?.text ?? status}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              value={supplierFilter}
              onChange={(event) => setSupplierFilter(event.target.value)}
            >
              <option value="">Todos los suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
            <input
              type="text"
              placeholder="Buscar tour o descripción"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-md">
          <table className="w-full text-sm text-slate-600">
            <thead className="text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Tour</th>
                <th className="px-3 py-2">Supplier</th>
                <th className="px-3 py-2">Destino</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Última edición</th>
                <th className="px-3 py-2">Revisar</th>
              </tr>
            </thead>
            <tbody>
              {filteredTours.map((tour) => {
                const status = statusLabels[tour.status]?.text ?? tour.status;
                return (
                  <tr
                    key={tour.id}
                    className={`cursor-pointer border-t border-slate-100 ${
                      tour.id === selectedTour?.id ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedId(tour.id)}
                  >
                    <td className="px-3 py-3 font-semibold text-slate-900">{tour.title}</td>
                    <td className="px-3 py-3">{tour.supplier.company}</td>
                    <td className="px-3 py-3">{tour.location}</td>
                    <td className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      {status}
                    </td>
                    <td className="px-3 py-3">{new Date(tour.createdAt).toLocaleDateString("es-DO")}</td>
                    <td className="px-3 py-3">
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(tour.id);
                        }}
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filteredTours.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-xs text-slate-400">
                    No hay tours que coincidan con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedTour ? (
        <div className="flex flex-col gap-4">
          <header className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Detalle</p>
                <h2 className="text-2xl font-semibold text-slate-900">{selectedTour.title}</h2>
                <p className="text-sm text-slate-600">
                  {selectedTour.supplier.company} · {selectedTour.location} · {selectedTour.duration}
                </p>
              </div>
              <div className="flex gap-3">
                <form action={approveTour}>
                  <input type="hidden" name="tourId" value={selectedTour.id} />
                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-emerald-500"
                  >
                    Aprobar & publicar
                  </button>
                </form>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setRequestTourId(selectedTour.id);
                    setRequestNote("");
                    setIsRequestModalOpen(true);
                  }}
                  className="rounded-2xl border border-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-600 transition hover:bg-amber-100"
                >
                  Solicitar cambios
                </button>
                <Link
                  href={`/preview/tour/${selectedTour.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-700"
                >
                  Ver como cliente
                </Link>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
              <span className="rounded-full border border-slate-200 px-3 py-1">
                Estado {statusLabels[selectedTour.status]?.text ?? selectedTour.status}
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Idioma {selectedTour.language}</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Precio ${selectedTour.price}</span>
            </div>
          </header>
          <div className="space-y-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-48 bg-slate-100">
                <Image
                  src={`https://images.unsplash.com/featured/?${encodeURIComponent(
                    selectedTour.location
                  )}`}
                  alt={selectedTour.title}
                  width={640}
                  height={320}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 px-4 py-3">
                <p className="text-sm text-slate-500">Descripción</p>
                <p className="text-base text-slate-900">{selectedTour.description}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Incluye:
                </p>
                <p className="text-sm text-slate-600">{selectedTour.includes}</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 px-4 py-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Info técnica</p>
                <p className="text-sm text-slate-600">ID: {selectedTour.id}</p>
                <p className="text-sm text-slate-600">Supplier ID: {selectedTour.supplier.id}</p>
                <p className="text-sm text-slate-600">
                  Creado: {new Date(selectedTour.createdAt).toLocaleDateString("es-DO")}
                </p>
                {selectedTour.adminNote && (
                  <p className="text-sm text-slate-600">Nota admin: {selectedTour.adminNote}</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Logística</p>
                <p className="text-sm text-slate-600">Punto de encuentro: {selectedTour.location}</p>
                <p className="text-sm text-slate-600">Pickup: Coordinado al momento</p>
                <p className="text-sm text-slate-600">Política de cancelación: Flexible</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500 shadow-sm">
          Selecciona un tour para revisar su ficha completa.
        </div>
      )}
    </div>
    {isRequestModalOpen && requestTourId && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        onClick={closeRequestModal}
      >
        <div
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Solicitud de cambios</p>
              <h3 className="text-lg font-semibold text-slate-900">¿Qué debe corregir este tour?</h3>
            </div>
            <button
              type="button"
              onClick={closeRequestModal}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Cerrar
            </button>
          </div>
          <form
            action={requestChanges}
            className="mt-4 space-y-4"
            onSubmit={closeRequestModal}
          >
            <input type="hidden" name="tourId" value={requestTourId} />
            <textarea
              name="note"
              value={requestNote}
              onChange={(event) => setRequestNote(event.target.value)}
              rows={4}
              required
              placeholder="Describe qué debe ajustar el proveedor antes de publicar este tour."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeRequestModal}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!requestNote.trim()}
                className="disabled:opacity-60 rounded-2xl bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-amber-600"
              >
                Enviar solicitud
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};
