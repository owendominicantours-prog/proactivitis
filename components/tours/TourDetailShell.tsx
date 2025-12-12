import type { Tour } from "@prisma/client";
import { ReactNode } from "react";

type TourWithSupplier = Tour & {
  heroImage?: string | null;
  gallery?: string | null;
  supplier: {
    id: string;
    company: string;
    user: { id: string; name?: string | null; email: string };
  };
};

const stateColorMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-700",
  needs_changes: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  paused: "bg-slate-200 text-slate-700"
};

export const TourDetailShell = ({ tour, bookingForm }: { tour: TourWithSupplier; bookingForm?: ReactNode }) => {
  const stateColor = stateColorMap[tour.status] ?? "bg-slate-100 text-slate-700";
  const coverImage = tour.heroImage ?? "/fototours/fototour.jpeg";
  let galleryImages = [coverImage];
  if (tour.gallery) {
    try {
      const parsed = JSON.parse(tour.gallery);
      if (Array.isArray(parsed) && parsed.length) {
        galleryImages = parsed;
      }
    } catch (error) {
      galleryImages = [coverImage];
    }
  }

  return (
    <main className="bg-slate-50 text-slate-900">
      <section
        className="relative overflow-hidden rounded-b-[60px] bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="mx-auto max-w-6xl px-6 py-16 relative">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">Preview · Tour ID {tour.id.slice(0, 8)}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight lg:text-5xl">{tour.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/90">{tour.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${stateColor}`}>
              {tour.status.replace("_", " ")}
            </span>
            <span className="rounded-full border border-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
              {tour.language}
            </span>
            <span className="rounded-full border border-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
              ${tour.price.toFixed(0)}
            </span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">Ficha completa</h2>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Supplier {tour.supplier.company} · {tour.location}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <article>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Duración</p>
                <p className="text-lg font-semibold text-slate-900">{tour.duration}</p>
              </article>
              <article>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Idiomas</p>
                <p className="text-lg font-semibold text-slate-900">{tour.language}</p>
              </article>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 w-full overflow-hidden rounded-2xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={galleryImages[index % galleryImages.length]}
                    alt={`${tour.title} ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Descripción</h3>
              <p className="text-sm text-slate-600">{tour.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué incluye</p>
                <p className="text-sm text-slate-700">{tour.includes}</p>
              </article>
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué no incluye</p>
                <p className="text-sm text-slate-700">Entradas opcionales, propinas y bebidas alcohólicas.</p>
              </article>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Políticas</p>
              <p className="text-sm text-slate-600">Cancelación flexible con reembolsos hasta 24 horas antes.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Logística</p>
              <ul className="text-sm text-slate-600">
                <li>Punto de encuentro: {tour.location} central</li>
                <li>Pickup: Coordina desde el hotel</li>
                <li>Horarios: 08:00 - 16:00</li>
              </ul>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Detalles internos</h3>
              <p className="text-sm text-slate-500">ID del tour: {tour.id}</p>
              <p className="text-sm text-slate-500">Supplier ID: {tour.supplier.id}</p>
              <p className="text-sm text-slate-500">Creado: {tour.createdAt.toLocaleDateString("es-DO")}</p>
              {tour.adminNote && <p className="mt-2 text-sm text-amber-600">Nota admin: {tour.adminNote}</p>}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Estado</h3>
              <p className="text-sm text-slate-500">{tour.status.replace("_", " ")}</p>
            </div>
            {bookingForm && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Reservar ahora</h3>
                {bookingForm}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};
