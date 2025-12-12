import { landingPages } from "@/lib/landing";

type Params = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return landingPages.map((landing) => ({ slug: landing.slug }));
}

export default function LandingPage({ params }: Params) {
  const landing = landingPages.find((item) => item.slug === params.slug);

  if (!landing) {
    return (
      <div className="mx-auto max-w-4xl py-20 px-6 text-center">
        <p className="text-xl font-semibold text-slate-900">Landing no encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl space-y-6 rounded-[36px] bg-white p-8 shadow-card">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">White Label</p>
        <h1 className="text-4xl font-bold text-slate-900">{landing.title}</h1>
        <p className="text-lg text-slate-500">{landing.tagline}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {landing.sections.map((section) => (
            <div key={section} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
              {section}
            </div>
          ))}
        </div>
        <button className="rounded-2xl bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-light">
          Pedir demo
        </button>
      </div>
    </div>
  );
}
