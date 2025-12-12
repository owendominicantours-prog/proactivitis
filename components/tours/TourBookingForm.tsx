"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/app/(public)/tours/[slug]/actions";

type Props = {
  tourId: string;
  initialDate?: string;
  initialAdults?: number;
  initialChildren?: number;
  hideDateAndPax?: boolean;
  selectedTime?: string;
};

export const TourBookingForm = ({
  tourId,
  initialDate,
  initialAdults = 1,
  initialChildren = 0,
  hideDateAndPax = false
  ,
  selectedTime
}: Props) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createBookingAction(formData);
      if (result?.stripeSessionUrl) {
        window.location.assign(result.stripeSessionUrl);
        return;
      }
      if (result?.bookingId) {
        router.push(`/booking/confirmed?bookingId=${result.bookingId}`);
        return;
      }
      setFeedback("Reserva creada. Te contactamos pronto.");
    } catch (error) {
      setFeedback((error as Error).message);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await handleSubmit(formData);
  };

  return (
    <form className="space-y-3 text-sm text-slate-700" onSubmit={onSubmit}>
      <input type="hidden" name="tourId" value={tourId} />
      {selectedTime && <input type="hidden" name="startTime" value={selectedTime} />}
      {hideDateAndPax ? (
        <>
          <input type="hidden" name="travelDate" value={initialDate ?? ""} />
          <input type="hidden" name="paxAdults" value={initialAdults} />
          <input type="hidden" name="paxChildren" value={initialChildren} />
        </>
      ) : (
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Fecha</span>
          <input
            type="date"
            name="travelDate"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Adultos</span>
          <input
            type="number"
            name="paxAdults"
            min="1"
            defaultValue="1"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Niños</span>
          <input
            type="number"
            name="paxChildren"
            min="0"
            defaultValue="0"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
      </div>
      )}
      <div className="grid gap-3">
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-400">Full name</span>
          <input
            type="text"
            name="customerName"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-400">Email</span>
          <input
            type="email"
            name="customerEmail"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-400">Phone</span>
          <input
            type="tel"
            name="customerPhone"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none"
          />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel (opcional)</span>
        <input type="text" name="hotel" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
      </label>
      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Notas de recogida</span>
        <textarea name="pickupNotes" rows={2} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"></textarea>
      </label>
      <button
        type="submit"
        className="inline-flex items-center rounded-md bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
      >
        Confirmar reserva
      </button>
      {feedback && <p className="text-sm text-slate-500">{feedback}</p>}
    </form>
  );
};
