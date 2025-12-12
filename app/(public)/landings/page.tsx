import Link from "next/link";
import { landingPages } from "@/lib/landing";

export default function LandingIndexPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl space-y-6 px-6">
        <header className="rounded-[32px] bg-white p-8 shadow-card">
          <h1 className="text-3xl font-semibold text-slate-900">Landings</h1>
          <p className="mt-2 text-slate-500">Mini-sites white-label para hoteles y partners.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {landingPages.map((landing) => (
            <article key={landing.slug} className="rounded-[28px] bg-white p-6 shadow-card border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">{landing.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{landing.tagline}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-500">
                {landing.sections.map((section) => (
                  <li key={section}>• {section}</li>
                ))}
              </ul>
              <Link href={`/landing/${landing.slug}`} className="mt-4 inline-flex text-sm font-semibold text-brand">
                Ver microsite
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
