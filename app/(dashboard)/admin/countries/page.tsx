"use server";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addCountryAction, addDestinationAction } from "@/app/(dashboard)/admin/countries/actions";

export default async function AdminCountriesPage() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: {
      destinations: { orderBy: { name: "asc" } }
    }
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Catálogo geográfico</p>
        <h1 className="text-3xl font-semibold text-slate-900">Países y zonas</h1>
        <p className="text-sm text-slate-600">
          Gestiona países y zonas con las que tus proveedores pueden operar. Los cambios se reflejan
          inmediatamente en filtros y formularios de tours.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agregar país</h2>
          <form action={addCountryAction} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Nombre
              <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Slug (sin espacios)
              <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Descripción corta
              <textarea name="shortDescription" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" rows={2}></textarea>
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              Guardar país
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agregar zona</h2>
          <form action={addDestinationAction} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              País
              <select name="countryId" defaultValue="" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
                <option value="" disabled>
                  Selecciona un país
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Nombre de la zona
              <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Slug (sin espacios)
              <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
            >
              Guardar zona
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Países existentes</h2>
          <Link href="/tours" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:underline">
            Ver tours públicos
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {countries.map((country) => (
            <article key={country.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{country.slug}</p>
                  <h3 className="text-xl font-semibold text-slate-900">{country.name}</h3>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{country.shortDescription ?? "Sin descripción corta."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {country.destinations.length ? (
                  country.destinations.map((destination) => (
                    <span key={destination.id} className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-semibold text-slate-600 shadow-sm">
                      {destination.name}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Aún no tiene zonas registradas.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
