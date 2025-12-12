"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectMap: Record<string, string> = {
    ADMIN: "/admin",
    SUPPLIER: "/supplier",
    AGENCY: "/agency",
    CUSTOMER: "/customer"
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/"
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
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
        <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            {loading ? "Validando..." : "Acceder"}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
          <Link
            href="/auth/reset"
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-slate-400"
          >
            Restablecer contraseña
          </Link>
          <Link
            href="/auth/register"
            className="rounded-2xl border border-brand px-4 py-2 font-semibold text-brand hover:bg-brand/10"
          >
            Crear cuenta de cliente
          </Link>
        </div>
      </div>
    </div>
  );
}
