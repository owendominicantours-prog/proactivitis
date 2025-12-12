import { toursCatalog } from "@/lib/destinations";

export default function SearchPage() {
  return (
    <div className="space-y-10 bg-slate-50 pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Buscador inteligente</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Filtra tours por destino, duración, idioma o proveedor. Los partners ven disponibilidad en tiempo real.
        </p>
      </div>
      <div className="mx-auto max-w-6xl space-y-4 px-6">
        {toursCatalog.map((tour) => (
          <div
            key={tour.id}
            className="rounded-[30px] bg-white p-6 shadow-card transition hover:border-slate-200 hover:bg-slate-50"
          >
            <h2 className="text-2xl font-semibold text-slate-900">{tour.title}</h2>
            <p className="text-sm text-slate-500">{tour.description}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>{tour.duration}</span>
              <span>{tour.language}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
