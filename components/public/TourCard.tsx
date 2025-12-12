"use client";

import Link from "next/link";

type TourCardProps = {
  slug: string;
  title: string;
  location: string;
  price: number;
  rating?: number;
  image: string;
};

export function TourCard({ slug, title, location, price, rating, image }: TourCardProps) {
  const displayRating = typeof rating === "number" ? rating.toFixed(1) : "4.8";
  return (
    <Link
      href={`/tours/${slug}`}
      className="group block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-lg transition hover:border-slate-300">
        <div
          className="h-52 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={title}
        />
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400">Desde {location}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="text-base font-semibold text-slate-800">⭐ {displayRating}</span>
            <span className="text-lg font-semibold text-slate-900">${price.toFixed(0)} USD</span>
          </div>
          <span className="mt-auto inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition group-hover:border-slate-300 group-hover:text-slate-900">
            Ver detalles
          </span>
        </div>
      </article>
    </Link>
  );
}
