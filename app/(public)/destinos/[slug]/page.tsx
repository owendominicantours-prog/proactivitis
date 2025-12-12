import Image from "next/image";
import Link from "next/link";
import {
  getAllDestinationSlugs,
  getDestinationBySlug,
  getToursByDestinationSlug
} from "@/lib/destinations";

type Params = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const destinations = await getAllDestinationSlugs();
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export default async function DestinationPage({ params }: Params) {
  const destination = await getDestinationBySlug(params.slug);
  const relatedTours = destination
    ? await getToursByDestinationSlug(destination.country.slug, destination.slug)
    : [];

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
            src={destination.heroImage ?? "/fototours/fototour.jpeg"}
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
          <p className="max-w-2xl text-sm text-white/80">
            {destination.shortDescription ?? "Descubre este destino mágico con tours seleccionados."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Tours en {destination.name}</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Experiencias con reseñas reales y precios transparentes
            </h2>
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
                  src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <span>{tour.category ?? "Experiencia"}</span>
                  <span>{tour.language}</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{tour.title}</h3>
                <p className="text-sm text-slate-500">{tour.location}</p>
                <p className="text-sm text-slate-500">{tour.description}</p>
                <div className="text-sm text-slate-500">Duración: {tour.duration}</div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span className="text-3xl font-bold text-brand">Desde ${tour.price.toFixed(0)}</span>
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
