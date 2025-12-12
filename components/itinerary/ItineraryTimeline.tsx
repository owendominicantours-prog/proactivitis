export type TimelineStop = {
  label: string;
  description?: string;
  duration?: string;
  detailLabel?: string;
  detailUrl?: string;
};

type EntryVariant = "start" | "stop" | "end";

type TimelineEntry = {
  variant: EntryVariant;
  badge: string;
  title: string;
  description?: string;
  duration?: string;
  detailLabel?: string;
  detailUrl?: string;
};

type ItineraryTimelineProps = {
  stops: TimelineStop[];
  startDescription?: string;
  finishDescription?: string;
  className?: string;
};

const badgeStyles: Record<EntryVariant, string> = {
  start: "bg-amber-500 text-white",
  stop: "bg-slate-900 text-white",
  end: "bg-emerald-500 text-white"
};

const defaultStartDescription =
  "Iniciamos tu aventura desde el punto acordado. Mantente listo para la bienvenida del equipo.";
const defaultFinishDescription = "Regresamos al punto de partida para despedirte con la mejor sonrisa.";

export function ItineraryTimeline({
  stops,
  startDescription,
  finishDescription,
  className
}: ItineraryTimelineProps) {
  if (!stops.length) return null;

  const entries: TimelineEntry[] = [
    {
      variant: "start",
      badge: "Inicio",
      title: "Inicio",
      description: startDescription ?? defaultStartDescription
    },
    ...stops.map((stop, index) => ({
      variant: "stop",
      badge: `${index + 1}`,
      title: stop.label,
      description: stop.description,
      duration: stop.duration,
      detailLabel: stop.detailLabel,
      detailUrl: stop.detailUrl
    })),
    {
      variant: "end",
      badge: "Fin",
      title: "Fin",
      description: finishDescription ?? defaultFinishDescription
    }
  ];

  return (
    <section
      className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Itinerario</p>
          <p className="text-lg font-semibold text-slate-900">Recorrido del tour</p>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Paso a paso</span>
      </div>

      <div className="relative mt-6 pl-10">
        <div className="pointer-events-none absolute left-6 top-2 bottom-2 w-px rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />

        {entries.map((entry, index) => (
          <div key={`${entry.variant}-${entry.title}-${index}`} className="relative mb-5 flex items-start gap-4">
            <span
              className={`relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.3em] shadow-sm ${badgeStyles[entry.variant]}`}
            >
              {entry.badge}
            </span>

            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                {entry.duration && (
                  <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500 shadow">
                    {entry.duration}
                  </span>
                )}
              </div>
              {entry.description && (
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{entry.description}</p>
              )}
              {entry.detailUrl && (
                <a
                  href={entry.detailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  {entry.detailLabel ?? "Ver detalles"}
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
