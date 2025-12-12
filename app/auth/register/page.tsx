"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectMap: Record<string, string> = {
    ADMIN: "/portal/admin",
    SUPPLIER: "/portal/supplier",
    AGENCY: "/portal/agency",
    CUSTOMER: "/portal/customer"
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error ?? "No se pudo crear la cuenta");
      return;
    }

    const signResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/"
    });

    if (signResult?.error) {
      setError("No se pudo iniciar sesión.");
      setLoading(false);
      return;
    }

    const sessionResponse = await fetch("/api/auth/session");
    if (!sessionResponse.ok) {
      router.push("/");
      return;
    }
    const sessionData = await sessionResponse.json();
    const role = sessionData?.user?.role ?? "CUSTOMER";
    router.push(redirectMap[role] || "/portal");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">Regístrate</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Nombre completo
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Email
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Contraseña
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
