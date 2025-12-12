"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type DurationOption = { value: string; label: string };

type Props = {
  countries: { name: string; slug: string }[];
  destinations: { name: string; slug: string; countrySlug: string }[];
  languages: string[];
  durations: DurationOption[];
};

export function TourFilters({ countries, destinations, languages, durations }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");

  // Inicializa estados desde la URL al montar/actualizar searchParams (sin efectos en cascada).
  const searchCountry = searchParams.get("country") ?? "";
  const searchDestination = searchParams.get("destination") ?? "";
  const searchMinPrice = searchParams.get("minPrice") ?? "";
  const searchMaxPrice = searchParams.get("maxPrice") ?? "";
  const searchLanguage = searchParams.get("language") ?? "";
  const searchDuration = searchParams.get("duration") ?? "";

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCountry(searchCountry);
    setDestination(searchDestination);
    setMinPrice(searchMinPrice);
    setMaxPrice(searchMaxPrice);
    setLanguage(searchLanguage);
    setDuration(searchDuration);
  }, [searchCountry, searchDestination, searchMinPrice, searchMaxPrice, searchLanguage, searchDuration]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleApply = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (destination) params.set("destination", destination);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (language) params.set("language", language);
    if (duration) params.set("duration", duration);
    const query = params.toString();
    router.push(query ? `/tours?${query}` : "/tours");
  };

  const handleReset = () => {
    setCountry("");
    setDestination("");
    setMinPrice("");
    setMaxPrice("");
    setLanguage("");
    setDuration("");
    router.push("/tours");
  };

  const isDestinationDisabled = !country;

  const filteredDestinations = destinations.filter((dest) => dest.countrySlug === country);

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Filtros</p>

        <label className="text-[0.7rem] font-semibold text-slate-600">
          País
          <select
            value={country}
            onChange={(event) => {
              setCountry(event.target.value);
              setDestination("");
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
        >
          <option value="">All countries</option>
          {countries.map((countryOption) => (
            <option key={countryOption.slug} value={countryOption.slug}>
              {countryOption.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-[0.7rem] font-semibold text-slate-600">
        Zona o destino
        <select
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          disabled={isDestinationDisabled}
        >
              <option value="">Todas las zonas</option>
          {(isDestinationDisabled ? destinations : filteredDestinations).map((destinationOption) => (
            <option key={destinationOption.slug} value={destinationOption.slug}>
              {destinationOption.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
      <label className="text-[0.7rem] font-semibold text-slate-600">
        Precio mínimo
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
            placeholder="0"
          />
        </label>
      <label className="text-[0.7rem] font-semibold text-slate-600">
        Precio máximo
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
            placeholder="500"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-[0.7rem] font-semibold text-slate-600">
          Idioma
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          >
          <option value="">Cualquier idioma</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[0.7rem] font-semibold text-slate-600">
          Duración
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Cualquier duración</option>
            {durations.map((durationOption) => (
              <option key={durationOption.value} value={durationOption.value}>
                {durationOption.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-800"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 hover:border-slate-400 hover:text-slate-900"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
