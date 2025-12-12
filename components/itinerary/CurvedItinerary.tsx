"use client";

import { useState } from "react";
import type { ItineraryStop } from "@/lib/itinerary";

type Props = {
  stops: ItineraryStop[];
};

export const CurvedItinerary = ({ stops }: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!stops.length) return null;

  const total = stops.length;

  const getVariant = (index: number) => {
    if (index === 0) return "start";
    if (index === total - 1) return "end";
    return "middle";
  };

  const getIcon = (variant: string) => {
    switch (variant) {
      case "start":
        return "G"; // pickup / meeting point
      case "end":
        return "✓"; // drop-off / end
      default:
        return "●"; // regular stop
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg md:p-6">
      <h3 className="text-lg font-semibold text-slate-900 md:text-xl">Itinerary</h3>
      <p className="mt-1 text-xs text-slate-500">
        Key moments of your Proactivitis experience, from pickup to drop-off.
      </p>

      <div className="mt-4 flex gap-4">
        {/* Columna de línea + puntos */}
        <div className="relative w-7">
          {/* Línea vertical */}
          <div className="absolute left-1/2 top-1 h-[calc(100%-0.5rem)] w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-500 via-sky-500/80 to-emerald-400" />

          {/* Puntos (solo decorativos, la burbuja real va en cada item) */}
          {stops.map((_, index) => (
            <div
              key={`dot-${index}`}
              className="relative flex h-16 items-center justify-center last:h-10"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-white/80 ring-2 ring-sky-500/60" />
            </div>
          ))}
        </div>

        {/* Lista de paradas */}
        <ol className="flex-1 space-y-3 text-sm text-slate-700">
          {stops.map((stop, index) => {
            const variant = getVariant(index);
            const icon = getIcon(variant);
            const isActive = activeIndex === index;

            return (
              <li
                key={`${stop.time}-${index}`}
                className="relative flex gap-3"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(index)}
              >
                {/* Icono sobre la línea */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-md transition
                      ${
                        variant === "start"
                          ? "bg-orange-500 text-white"
                          : variant === "end"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-900 text-white"
                      }
                      ${isActive ? "scale-110 ring-2 ring-sky-300" : "scale-100"}
                    `}
                  >
                    {icon}
                  </div>
                </div>

                {/* Texto */}
                <div
                  className={`flex-1 rounded-2xl px-3.5 py-2.5 transition
                    ${
                      isActive
                        ? "bg-sky-50/80 border border-sky-200"
                        : "bg-slate-50 border border-transparent hover:border-slate-200"
                    }
                  `}
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stop.time}
                  </p>
                  <p className="mt-0.5 text-[0.9rem] font-semibold text-slate-900">
                    {stop.title}
                  </p>
                  {stop.description && (
                    <p className="mt-0.5 text-[0.8rem] leading-snug text-slate-600">
                      {stop.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};