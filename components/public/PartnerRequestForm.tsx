"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const countryOptions = [
  "Dominican Republic",
  "Mexico",
  "Colombia",
  "United States",
  "Spain",
  "Brazil",
  "Peru",
  "Argentina",
  "Panama"
];

const serviceOptions = [
  "Tours",
  "Hospedaje",
  "Transporte",
  "Experiencias al aire libre",
  "Planificación de grupos",
  "Vuelos",
  "Eventos privados"
];

const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
};

type PartnerRequestFormProps = {
  role: "SUPPLIER" | "AGENCY";
  subtitle?: string;
  id?: string;
};

export default function PartnerRequestForm({ role, subtitle, id }: PartnerRequestFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(countryOptions[0]);
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasServices = useMemo(() => selectedServices.length > 0, [selectedServices]);

  const handleServiceToggle = (option: string) => {
    setSelectedServices((current) =>
      current.includes(option) ? current.filter((value) => value !== option) : [...current, option]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const targetFile = event.target.files?.[0] ?? null;
    setFile(targetFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!hasServices) {
      setMessage("Selecciona al menos un tipo de servicio.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        role,
        companyName,
        contactName,
        contactRole,
        email,
        phone,
        country,
        website: website || null,
        serviceTypes: selectedServices,
        description,
        password,
        confirmPassword
      };

      if (file) {
        payload.documentName = file.name;
        payload.documentData = await fileToBase64(file);
      }

      const response = await fetch("/api/partner-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "No se pudo enviar la solicitud");
      }

      setCompanyName("");
      setContactName("");
      setContactRole("");
      setEmail("");
      setPhone("");
      setCountry(countryOptions[0]);
      setWebsite("");
      setDescription("");
      setSelectedServices([]);
      setFile(null);
      setPassword("");
      setConfirmPassword("");
      setMessage("Solicitud enviada. Te contactaremos pronto.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Solicitud de {role === "SUPPLIER" ? "Supplier" : "Agency"}
        </p>
        {subtitle ? <p className="mt-1 text-lg font-semibold text-slate-900">{subtitle}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Nombre de la empresa</span>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Nombre del contacto</span>
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Cargo del contacto</span>
          <input
            value={contactRole}
            onChange={(event) => setContactRole(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Teléfono</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            placeholder="+1 809 123 4567"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">País de operación</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {countryOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Sitio web</span>
          <input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="https://"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-500">Repite la contraseña</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Tipo de servicio</p>
        <p className="text-sm text-slate-500">Selecciona los servicios que ofreces.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {serviceOptions.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => handleServiceToggle(option)}
              className={`rounded-full border px-4 py-1 text-sm transition ${
                selectedServices.includes(option)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-xs uppercase text-slate-500">Descripción breve del servicio</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-xs uppercase text-slate-500">Documentación adjunta (opcional)</span>
        <input type="file" className="mt-1" accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg" onChange={handleFileChange} />
        {file && <p className="mt-1 text-xs text-slate-500">Archivo listo: {file.name}</p>}
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar solicitud"}
        </button>
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      </div>
    </form>
  );
}
