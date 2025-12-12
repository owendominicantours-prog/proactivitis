"use client";

import { useMemo, useState } from "react";

import { DynamicImage } from "@/components/shared/DynamicImage";

export type AgencyTourSummary = {
  id: string;
  title: string;
  price: number;
  location: string;
  supplier: string;
  heroImage?: string | null;
  duration?: string;
  rating?: number;
};

export const TourCatalog = ({ tours }: { tours: AgencyTourSummary[] }) => {
  const [destinationFilter, setDestinationFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const destinations = useMemo(
    () => Array.from(new Set(tours.map((tour) => tour.location))),
    [tours]
  );
  const suppliers = useMemo(
    () => Array.from(new Set(tours.map((tour) => tour.supplier))),
    [tours]
  );

  const filtered = useMemo(() => {
    return tours.filter((tour) => {
      const matchesDestination = destinationFilter ? tour.location === destinationFilter : true;
      const matchesSupplier = supplierFilter ? tour.supplier === supplierFilter : true;
      return matchesDestination && matchesSupplier;
    });
  }, [tours, destinationFilter, supplierFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <select
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
          value={destinationFilter}
          onChange={(event) => setDestinationFilter(event.target.value)}
        >
          <option value="">Todos los destinos</option>
          {destinations.map((destination) => (
            <option key={destination} value={destination}>
              {destination}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
          value={supplierFilter}
          onChange={(event) => setSupplierFilter(event.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {suppliers.map((supplier) => (
            <option key={supplier} value={supplier}>
              {supplier}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((tour) => (
          <div
            key={tour.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-16 w-28 overflow-hidden rounded-md bg-slate-100">
                <DynamicImage
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{tour.title}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Destino {tour.location}</p>
              </div>
            </div>
            <div className="flex min-w-[180px] flex-col gap-1 text-sm text-slate-600">
              <p>
                Precio público:{" "}
                <span className="font-semibold text-indigo-600">${tour.price.toFixed(0)}</span>
              </p>
              <p>
                Precio neto agencia:{" "}
                <span className="font-semibold text-slate-900">
                  ${(tour.price * 0.8).toFixed(0)}
                </span>
              </p>
              <p>
                Comisión agencia:{" "}
                <span className="font-semibold text-slate-900">
                  ${(tour.price * 0.2).toFixed(0)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:border-slate-300">Editar</button>
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:border-slate-300">
                Pausar
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:border-slate-300 bg-slate-50">
                Ver en web
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 text-sky-500 hover:border-slate-300">
                Vender / Crear reserva
              </button>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            No hay tours publicados para este proveedor.
          </div>
        )}
      </div>
    </div>
  );
};
