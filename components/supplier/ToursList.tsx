"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";

import { DynamicImage } from "@/components/shared/DynamicImage";
import { deleteSupplierTourAction } from "@/app/(dashboard)/supplier/tours/actions";
import { sendToReview, togglePauseTour } from "@/lib/actions/tourModeration";

export type SupplierTourSummary = {
  id: string;
  slug: string;
  productId: string;
  title: string;
  price: number;
  location: string;
  status: "published" | "draft" | "pending" | "needs_changes" | "paused" | "under_review";
  rating: number;
  heroImage?: string | null;
  destination?: string | null;
  duration?: string | null;
  description?: string | null;
  language?: string | null;
  includes?: string | null;
  platformSharePercent?: number;
};

const statusStyles: Record<SupplierTourSummary["status"], string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-50 text-slate-500",
  pending: "bg-amber-50 text-amber-700",
  under_review: "bg-amber-50 text-amber-700",
  needs_changes: "bg-amber-50 text-amber-700",
  paused: "bg-slate-50 text-slate-500"
};

export const ToursList = ({ tours }: { tours: SupplierTourSummary[] }) => {
  const [statusFilter, setStatusFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [infoOpen, setInfoOpen] = useState<Record<string, boolean>>({});
  const [impulzaVisible, setImpulzaVisible] = useState<Record<string, boolean>>({});

  const destinations = useMemo(() => Array.from(new Set(tours.map((tour) => tour.destination ?? tour.location))), [tours]);

  const filtered = useMemo(() => {
    return tours.filter((tour) => {
      const matchesStatus = statusFilter ? tour.status === statusFilter : true;
      const matchesDestination = destinationFilter
        ? (tour.destination ?? tour.location) === destinationFilter
        : true;
      return matchesStatus && matchesDestination;
    });
  }, [tours, statusFilter, destinationFilter]);

  const initialShares = useMemo(
    () =>
      tours.reduce<Record<string, number>>((acc, tour) => {
        acc[tour.id] = tour.platformSharePercent ?? 20;
        return acc;
      }, {}),
    [tours]
  );

  const [shareValues, setShareValues] = useState<Record<string, number>>(initialShares);
  const [shareStatus, setShareStatus] = useState<Record<string, "idle" | "saving" | "error">>({});
  const [shareFeedback, setShareFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    setShareValues(initialShares);
  }, [initialShares]);

const getProactiveMessage = (value: number) => {
    if (value > 30) {
      return "Máximo Impulso. Tu tour recibe la prioridad más alta en nuestras campañas.";
    }
    if (value >= 26) {
      return "Liderazgo asegurado. Estás en el nivel de inversión de los tours más vendidos.";
    }
    if (value >= 21) {
      return "¡Superarás al 40% de tu competencia! La inversión en marketing te da ventaja.";
    }
    return "Tu 80% está protegido. El nivel base garantiza una presencia sólida.";
  };

  const handleShareChange = (tourId: string, nextValue: number) => {
    setShareValues((prev) => ({ ...prev, [tourId]: nextValue }));
    setShareFeedback((prev) => ({ ...prev, [tourId]: "" }));
  };

  const handleShareSave = async (tourId: string) => {
    const payload = shareValues[tourId];
    if (typeof payload !== "number") {
      return;
    }
    setShareStatus((prev) => ({ ...prev, [tourId]: "saving" }));
    try {
      const response = await fetch(`/api/tours/${tourId}/platform-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ share: payload })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo actualizar tu porcentaje.");
      }
      const body = await response.json().catch(() => ({}));
      const normalized = Number(body.platformSharePercent ?? payload);
      setShareValues((prev) => ({ ...prev, [tourId]: normalized }));
      setShareFeedback((prev) => ({ ...prev, [tourId]: "Impulso guardado" }));
      setShareStatus((prev) => ({ ...prev, [tourId]: "idle" }));
    } catch (error) {
      setShareStatus((prev) => ({ ...prev, [tourId]: "error" }));
      setShareFeedback((prev) => ({
        ...prev,
        [tourId]:
          error instanceof Error ? error.message : "No se pudo guardar el porcentaje, inténtalo de nuevo."
      }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <select
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-500 focus:outline-none"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="pending">En revisión</option>
          <option value="needs_changes">Necesita cambios</option>
          <option value="paused">Pausado</option>
        </select>
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
      </div>

      <div className="space-y-3">
        {filtered.map((tour) => {
          const sharePercent = shareValues[tour.id] ?? tour.platformSharePercent ?? 20;
          const supplierPercent = Math.max(100 - sharePercent, 0);
          const platformCut = (tour.price * (sharePercent / 100)).toFixed(2);
          const supplierCut = (tour.price * (supplierPercent / 100)).toFixed(2);
          const agencyPercent = (sharePercent * 0.18).toFixed(2);
          return (
            <div
              key={tour.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tour.location}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">ID del producto: {tour.productId}</p>
                <div className="mt-1 text-xs text-slate-500">Rating {tour.rating.toFixed(1)} · Estado {tour.status}</div>
              </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                ${tour.price.toFixed(0)} desde
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[tour.status]}`}>
                {tour.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
              <Link
                href={`/supplier/tours/${tour.id}/edit`}
                className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
              >
                Editar
              </Link>
              <form action={togglePauseTour} className="inline-flex">
                <input type="hidden" name="tourId" value={tour.id} />
                <input type="hidden" name="currentStatus" value={tour.status} />
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
                >
                  {tour.status === "paused" ? "Reanudar" : "Pausar"}
                </button>
              </form>
              <Link
                href={`/supplier/tours/${tour.id}/edit`}
                className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
              >
                Editar
              </Link>
              <Link
                href={`/tours/${tour.slug}`}
                className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
              >
                Ver en web
              </Link>
              <Link
                href={`/preview/tour/${tour.id}`}
                target="_blank"
                className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
              >
                Vista previa
              </Link>
              {["draft", "needs_changes"].includes(tour.status) && (
                <form action={sendToReview} className="inline-flex">
                  <input type="hidden" name="tourId" value={tour.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-slate-300"
                  >
                    Enviar a revisión
                  </button>
                </form>
              )}
              {tour.status !== "published" && (
                <form action={deleteSupplierTourAction} className="inline-flex">
                  <input type="hidden" name="tourId" value={tour.id} />
                  <button
                    type="submit"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      if (
                        !confirm(
                          "Eliminarás este tour de forma permanente. ¿Quieres continuar?"
                        )
                      ) {
                        event.preventDefault();
                      }
                    }}
                    className="rounded-md border border-rose-300 px-3 py-1 text-rose-600 transition hover:border-rose-400"
                    aria-label="Eliminar tour"
                  >
                    Eliminar tour
                  </button>
                </form>
              )}
            </div>
            <div className="mt-3 w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[0.75rem] text-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Impulza marketing</p>
                  <p className="text-[0.75rem] text-slate-900">
                    Comisión: {sharePercent}% · Tu ingreso neto: <span className="font-semibold">{supplierPercent}%</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setImpulzaVisible((prev) => ({ ...prev, [tour.id]: !prev[tour.id] }))
                  }
                  className="text-[0.65rem] font-semibold text-slate-600 underline"
                >
                  Ver Impulza
                </button>
              </div>
              {impulzaVisible[tour.id] && (
                <div className="mt-3 space-y-2 text-[0.65rem] text-slate-500">
                  <input
                    type="range"
                    min={20}
                    max={50}
                    step={1}
                    value={sharePercent}
                    onChange={(event) => handleShareChange(tour.id, Number(event.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex items-center justify-between text-slate-500">
                    <button
                      type="button"
                      onClick={() =>
                        setInfoOpen((prev) => ({ ...prev, [tour.id]: !prev[tour.id] }))
                      }
                      className="rounded-full border border-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600"
                    >
                      ⓘ ¿Cómo se usa este 20%?
                    </button>
                    <span>{getProactiveMessage(sharePercent)}</span>
                  </div>
                  {infoOpen[tour.id] && (
                    <p className="text-[0.65rem] text-slate-500">
                      El 20% financia tu marketing:
                      <br />
                      - Agencia: 3.6% va a la agencia y 16.4% al marketing.
                      <br />
                      - Directa: el 20% completo va a marketing. Tu ingreso neto siempre es 80%.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleShareSave(tour.id)}
                    disabled={shareStatus[tour.id] === "saving"}
                    className="w-full rounded-full bg-emerald-600 px-3 py-1 text-[0.65rem] font-semibold uppercase text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {shareStatus[tour.id] === "saving" ? "Guardando..." : "Guardar Impulso"}
                  </button>
                  {shareFeedback[tour.id] && (
                    <p
                      className={`text-[0.65rem] ${
                        shareStatus[tour.id] === "error" ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {shareFeedback[tour.id]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
        {!filtered.length && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            No hay tours que coincidan con los filtros.
          </div>
        )}
      </div>
    </div>
  );
};
