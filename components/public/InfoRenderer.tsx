"use client";

import Link from "next/link";
import type { InfoPage } from "@/lib/infoPages";
import { FormEvent, useState } from "react";

type Props = {
  page: InfoPage;
};

export function InfoRenderer({ page }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") {
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((payload as any).error ?? "No se pudo enviar tu mensaje.");
      }
      setStatus("success");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  };
  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{page.hero.eyebrow}</p>
          <h1 className={`font-semibold text-slate-900 ${page.hero.layout === "narrow" ? "text-3xl" : "text-4xl md:text-5xl"}`}>
            {page.hero.title}
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-3xl">{page.hero.subtitle}</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        {page.sections.map((section, idx) => {
          switch (section.type) {
            case "columns":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {section.columns.map((col) => (
                      <div key={col.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <h3 className="text-sm font-semibold text-slate-800">{col.title}</h3>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {col.items.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "faq":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="font-semibold text-slate-900">{item.question}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "faq-group":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="font-semibold text-slate-900">{item.question}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "cta":
              return (
                <section key={idx} className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <p className="mt-2 text-sm text-slate-100">{section.body}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={section.primaryHref}
                      className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
                    >
                      {section.primaryLabel}
                    </Link>
                    {section.secondaryHref && section.secondaryLabel ? (
                      <Link
                        href={section.secondaryHref}
                        className="inline-flex items-center rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        {section.secondaryLabel}
                      </Link>
                    ) : null}
                  </div>
                </section>
              );
            case "contact-info":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "form":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  {section.description && <p className="text-sm text-slate-600 max-w-2xl">{section.description}</p>}
                  <form
                    className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    method="post"
                    action="/api/contact"
                    onSubmit={handleSubmit}
                  >
                    {section.fields.map((field) => (
                      <label key={field.name} className="block text-sm font-semibold text-slate-700 space-y-1">
                        <span>{field.label}{field.required ? " *" : ""}</span>
                        {field.type === "select" ? (
                          <select
                            name={field.name}
                            required={field.required}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            required={field.required}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                          />
                        ) : (
                          <input
                            name={field.name}
                            type={field.type}
                            required={field.required}
                            placeholder={field.placeholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                          />
                        )}
                      </label>
                    ))}
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                    >
                      {status === "loading" ? "Enviando..." : section.submitLabel}
                    </button>
                    <div aria-live="polite" className="min-h-[1.25rem] text-sm">
                      {status === "success" && <p className="text-emerald-600">Gracias, recibimos tu mensaje.</p>}
                      {status === "error" && errorMessage && <p className="text-rose-600">{errorMessage}</p>}
                    </div>
                  </form>
                </section>
              );
            case "steps":
              return (
                <section key={idx} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    {section.steps.map((step) => (
                      <div key={step.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{step.label}</p>
                        <p className="text-sm text-slate-700">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case "text":
              return (
                <section key={idx} className="space-y-3">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  {section.body.map((p, i) => (
                    <p key={i} className="text-sm text-slate-700 max-w-3xl">
                      {p}
                    </p>
                  ))}
                </section>
              );
            case "bullets":
              return (
                <section key={idx} className="space-y-3">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              );
            case "list":
              return (
                <section key={idx} className="space-y-3">
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              );
            case "legal-section":
              return (
                <section key={idx} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                  {section.body.map((p, i) => (
                    <p key={i} className="text-sm text-slate-700">
                      {p}
                    </p>
                  ))}
                </section>
              );
            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}
