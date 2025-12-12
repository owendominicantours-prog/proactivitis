import Image from "next/image";
import Link from "next/link";
import { destinations, toursCatalog } from "@/lib/destinations";

type Params = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export default function DestinationPage({ params }: Params) {
  const destination = destinations.find((item) => item.slug === params.slug);
  const relatedTours = toursCatalog.filter((tour) => destination?.tours.includes(tour.id));

  if (!destination) {
    return (
      <div className="mx-auto max-w-4xl py-20 px-6 text-center">
        <p className="text-xl font-semibold text-slate-900">Destino no encontrado</p>
        <p className="mt-2 text-slate-500">Regresa a la página principal para explorar más tours.</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <section className="relative overflow-hidden">
        <div className="relative h-[360px]">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/10 to-transparent" />
        </div>
        <div className="absolute inset-y-0 left-6 flex flex-col justify-center space-y-3 text-white">
          <p className="text-xs uppercase tracking-[0.5em]">{destination.name}</p>
          <h1 className="text-4xl font-black lg:text-5xl">{destination.name}</h1>
          <p className="max-w-2xl text-sm text-white/80">{destination.summary}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Tours en {destination.name}</p>
            <h2 className="text-3xl font-bold text-slate-900">Experiencias con reviews reales y precios transparentes</h2>
          </div>
          <Link href="/tours" className="text-sm font-semibold text-brand underline">
            Ver todo el catálogo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {relatedTours.map((tour) => (
            <article
              key={tour.id}
              className="flex flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-lg"
            >
              <div className="relative h-52">
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  <span>{tour.category}</span>
                  <span className="text-amber-500">★ {tour.rating.toFixed(1)}</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{tour.title}</h3>
                <p className="text-sm text-slate-500">{tour.description}</p>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{tour.reviews}</span> reviews · {tour.duration}
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span className="text-3xl font-bold text-brand">${tour.price}</span>
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand">
                    Reservar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
