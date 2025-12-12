"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DynamicImage } from "@/components/shared/DynamicImage";
import { approveTour, deleteTourAction, requestChanges } from "@/lib/actions/tourModeration";
import { TOUR_DELETE_REASONS } from "@/lib/constants/tourDeletion";

export type SimpleTourRecord = {
  id: string;
  slug: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  language: string;
  includes: string;
  location: string;
  supplier: {
    name: string;
  };
  status: string;
  heroImage?: string | null;
  country?: string | null;
};

const statusLabels: Record<string, { text: string; color: string }> = {
  published: { text: "Publicado", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  draft: { text: "Borrador", color: "bg-slate-50 text-slate-600 border border-slate-200" },
  under_review: { text: "En revisión", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  pending: { text: "Pendiente", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  needs_changes: { text: "Necesita cambios", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  paused: { text: "Pausado", color: "bg-slate-50 text-slate-600 border border-slate-200" }
};

type Props = {
  tours: SimpleTourRecord[];
};

const badgeClasses = (status: string) => statusLabels[status]?.color ?? "bg-slate-50 text-slate-600 border border-slate-200";

export const TourModerationConsole = ({ tours }: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [selectedId, setSelectedId] = useState(tours[0]?.id ?? "");

  const suppliers = useMemo(
    () => Array.from(new Set(tours.map((tour) => tour.supplier.name))),
    [tours]
  );

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch = search
        ? tour.title.toLowerCase().includes(search.toLowerCase()) ||
          tour.slug === search ||
          tour.id === search
        : true;
      const matchesStatus = statusFilter ? tour.status === statusFilter : true;
      const matchesSupplier = supplierFilter ? tour.supplier.name === supplierFilter : true;
      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [tours, search, statusFilter, supplierFilter]);

  const selectedTour = filteredTours.find((tour) => tour.id === selectedId) ?? filteredTours[0];
  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "published", label: "Publicado" },
    { value: "draft", label: "Borrador" },
    { value: "pending", label: "En revisión" },
    { value: "needs_changes", label: "Necesita cambios" },
    { value: "paused", label: "Pausado" }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Modera los tours creados por cada proveedor. Revisa su estado y solicita cambios cuando sea necesario.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <input
            type="text"
            placeholder="Buscar por nombre o ID"
            className="flex-1 min-w-[200px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
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
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-3 py-3 text-left">Tour</th>
                <th className="px-3 py-3">Supplier</th>
                <th className="px-3 py-3">Destino</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTours.map((tour) => (
                <tr
                  key={tour.id}
                  className={`group cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 ${
                    selectedTour?.id === tour.id ? "bg-slate-50" : ""
                  }`}
                  onClick={() => setSelectedId(tour.id)}
                >
                  <td className="flex items-center gap-3 px-3 py-3">
                    <div className="h-12 w-20 overflow-hidden rounded-md bg-slate-100">
                      <DynamicImage
                        src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                        alt={tour.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{tour.title}</p>
                      <p className="text-xs text-slate-500">Duración {tour.duration}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">{tour.supplier.name}</td>
                  <td className="px-3 py-3">{tour.location}</td>
                  <td className="px-3 py-3">
                    <span className={`${badgeClasses(tour.status)} inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold`}>
                      {statusLabels[tour.status]?.text ?? tour.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {tour.status === "published" && (
                        <Link href={`/tours/${tour.slug}`} className="text-xs font-semibold text-sky-500 hover:underline">
                          Ver en web pública
                        </Link>
                      )}
                      <button
                        className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900"
                        type="button"
                      >
                        Revisar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredTours.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-400">
                    No hay tours que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {selectedTour ? (
          <TourDetailPanel tour={selectedTour} />
        ) : (
          <p className="text-sm text-slate-500">Selecciona un tour para revisar su ficha completa.</p>
        )}
      </div>
    </div>
  );
};

const TourDetailPanel = ({ tour }: { tour: SimpleTourRecord }) => {
  const coverImage = tour.heroImage ?? "/fototours/fototour.jpeg";

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState(TOUR_DELETE_REASONS[0]?.value ?? "");

  const openDeleteDialog = () => {
    setDeleteReason(TOUR_DELETE_REASONS[0]?.value ?? "");
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="h-48 overflow-hidden rounded-lg bg-slate-100">
        <DynamicImage
          src={coverImage}
          alt={tour.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
        <p className="text-sm text-slate-500">
          {tour.supplier.name} · {tour.location}
        </p>
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <p>{tour.description}</p>
        <p>
          <span className="font-semibold text-slate-900">Incluye:</span> {tour.includes}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Idiomas:</span> {tour.language}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Duración:</span> {tour.duration}
        </p>
      </div>
      <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span className={`rounded-full ${badgeClasses(tour.status)} px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em]`}>
            {statusLabels[tour.status]?.text ?? tour.status}
          </span>
          <span className="text-sm font-semibold text-slate-900">${tour.price.toFixed(0)}</span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Políticas</p>
        <p className="text-sm text-slate-600">Cancelación flexible hasta 24h antes.</p>
      </div>
      <div className="space-y-3">
        <form action={approveTour} className="flex flex-wrap gap-3">
          <input type="hidden" name="tourId" value={tour.id} />
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Aprobar y publicar
          </button>
        </form>
        <form action={requestChanges} className="space-y-2">
          <input type="hidden" name="tourId" value={tour.id} />
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Detalla qué debe ajustarse
            <textarea
              required
              name="note"
              rows={3}
              placeholder="Ejemplo: Actualiza el itinerario, agrega fotos con gente y detalla el pickup."
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            Solicitar cambios
          </button>
        </form>
        <button
          type="button"
          onClick={openDeleteDialog}
          className="inline-flex items-center rounded-md border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:border-rose-400"
        >
          Eliminar tour
        </button>
      </div>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Eliminar tour</p>
                <p className="text-xs text-slate-500">
                  Selecciona el motivo y confirma para notificar al proveedor.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
            <form
              action={deleteTourAction}
              onSubmit={closeDeleteDialog}
              className="mt-4 space-y-4"
            >
              <input type="hidden" name="tourId" value={tour.id} />
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Motivo
                <select
                  name="reason"
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                  required
                >
                  {TOUR_DELETE_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-rose-600 px-4 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Confirmar eliminación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
