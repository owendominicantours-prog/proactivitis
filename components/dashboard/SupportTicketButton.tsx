"use client";

import { FormEvent, useMemo, useState } from "react";

const defaultTopics = [
  "Booking support",
  "Payment & refund",
  "Supplier onboarding",
  "Agency partnership",
  "Technical issue",
  "Other"
];

type SupportTicketButtonProps = {
  name?: string | null;
  email?: string | null;
  roleLabel?: string;
};

const sanitize = (value: string | null | undefined) => (value ?? "").trim();

type BookingSearchResult = {
  id: string;
  customerName: string;
  customerEmail: string;
  travelDate: string;
  totalAmount: number;
  tourTitle: string | null;
};

export function SupportTicketButton({ name, email, roleLabel }: SupportTicketButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState(defaultTopics[0]);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [bookingSearchStatus, setBookingSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [bookingSearchMessage, setBookingSearchMessage] = useState<string | null>(null);
  const [bookingResults, setBookingResults] = useState<BookingSearchResult[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingSearchResult | null>(null);

  const prefillName = useMemo(() => sanitize(name), [name]);
  const prefillEmail = useMemo(() => sanitize(email), [email]);
  const isReservationTopic = useMemo(() => {
    const normalized = topic.toLowerCase();
    return normalized.includes("booking") || normalized.includes("reserva");
  }, [topic]);

  const formatBookingDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString("es-ES", { dateStyle: "medium" });
    } catch {
      return value;
    }
  };

  const handleBookingCodeInput = (value: string) => {
    setBookingCode(value);
    if (selectedBooking && selectedBooking.id !== value) {
      setSelectedBooking(null);
    }
  };

  const handleBookingSearch = async () => {
    const trimmed = bookingSearchQuery.trim();
    if (!trimmed) {
      setBookingSearchMessage("Ingresa un código, nombre o correo para buscar reservas.");
      setBookingResults([]);
      return;
    }

    setBookingSearchStatus("loading");
    setBookingSearchMessage(null);
    try {
      const response = await fetch(`/api/bookings?q=${encodeURIComponent(trimmed)}`);
      if (!response.ok) {
        throw new Error("No se pudo buscar tus reservas.");
      }
      const payload = await response.json().catch(() => ({}));
      const hits: BookingSearchResult[] = (payload.bookings ?? []) as BookingSearchResult[];
      setBookingResults(hits);
      setBookingSearchStatus("idle");
      if (!hits.length) {
        setBookingSearchMessage("No se encontraron coincidencias.");
      } else {
        setBookingSearchMessage(`${hits.length} reserva(s) encontrada(s).`);
      }
    } catch (error) {
      setBookingSearchStatus("error");
      setBookingSearchMessage(error instanceof Error ? error.message : "No se pudo buscar tus reservas.");
      setBookingResults([]);
    }
  };

  const handleSelectBooking = (booking: BookingSearchResult) => {
    setSelectedBooking(booking);
    setBookingCode(booking.id);
    setBookingSearchMessage(`Reserva seleccionada: ${booking.tourTitle ?? booking.customerName}`);
    setBookingResults([]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", prefillName || (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value);
      formData.append("email", prefillEmail || (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value);
      formData.append("topic", topic);
      formData.append("message", message);
      formData.append("bookingCode", bookingCode);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as any).error ?? "No se pudo enviar el ticket.");
      }

      setStatus("success");
      setMessage("");
      setBookingCode("");
      setSelectedBooking(null);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setStatus("idle");
            setErrorMessage(null);
          }}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-slate-900/30 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span className="h-5 w-5 rounded-full bg-sky-400 text-[0.65rem] font-bold leading-tight text-slate-900">?</span>
          {roleLabel ? `Ticket ${roleLabel}` : "Enviar ticket"}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 py-6 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Ticket a admin</h2>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Usa el mismo formulario interno para que proveedores/agencias levanten tickets con toda la información necesaria.
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {!prefillName && (
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Nombre
                  <input
                    name="name"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                  />
                </label>
              )}
              {!prefillEmail && (
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                  />
                </label>
              )}
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Tema
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                >
                  {defaultTopics.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Código de reserva (opcional)
                <input
                  value={bookingCode}
                  onChange={(event) => handleBookingCodeInput(event.target.value)}
                  placeholder="Si aplica"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                />
              </label>
              {isReservationTopic && (
                <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Buscar reservas activas</p>
                    <button
                      type="button"
                      onClick={handleBookingSearch}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={bookingSearchStatus === "loading"}
                    >
                      {bookingSearchStatus === "loading" ? "Buscando..." : "Buscar"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={bookingSearchQuery}
                      onChange={(event) => setBookingSearchQuery(event.target.value)}
                      placeholder="Código, nombre o correo"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  {bookingSearchMessage && <p className="text-[0.65rem] text-slate-500">{bookingSearchMessage}</p>}
                  {selectedBooking && (
                    <div className="rounded-xl bg-white p-3 text-[0.65rem] text-slate-500 shadow-inner">
                      <p className="text-slate-900">Reserva seleccionada</p>
                      <p className="font-semibold text-slate-900">#{selectedBooking.id}</p>
                      <p>{selectedBooking.tourTitle ?? selectedBooking.customerName}</p>
                      <p className="text-[0.6rem] text-slate-400">{formatBookingDate(selectedBooking.travelDate)}</p>
                    </div>
                  )}
                  {bookingResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {bookingResults.map((booking) => (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => handleSelectBooking(booking)}
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-[0.65rem] text-slate-700 transition hover:border-emerald-600 hover:bg-emerald-50"
                        >
                          <p className="text-slate-900">{booking.tourTitle ?? booking.customerName}</p>
                          <p className="text-[0.55rem] text-slate-500">#{booking.id}</p>
                          <p className="text-[0.55rem] text-slate-500">
                            {booking.customerName} • {formatBookingDate(booking.travelDate)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Mensaje
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                  placeholder="Cuéntanos qué necesitas"
                />
              </label>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Enviando..." : "Enviar ticket"}
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-500 underline-offset-2 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
              </div>
              <div aria-live="polite" className="min-h-[1rem] text-sm">
                {status === "success" && <p className="text-emerald-600">Ticket enviado, vemos el caso.</p>}
                {status === "error" && errorMessage && <p className="text-rose-600">{errorMessage}</p>}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
