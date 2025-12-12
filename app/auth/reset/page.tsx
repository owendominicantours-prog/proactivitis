"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    // Placeholder: replace with API call when endpoint exists
    setTimeout(() => {
      setMessage("Recibirás un correo con instrucciones para restablecer tu contraseña.");
      setSending(false);
    }, 800);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">Restablecer contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Indica la dirección de correo asociada a tu cuenta y te enviaremos el enlace para recuperar el acceso.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            disabled={sending}
          >
            {sending ? "Enviando..." : "Enviar enlace"}
          </button>
          {message && <p className="pt-2 text-xs text-emerald-600">{message}</p>}
        </form>
      </div>
    </div>
  );
}
