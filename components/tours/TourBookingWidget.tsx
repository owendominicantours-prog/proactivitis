"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { TourBookingForm } from "@/components/tours/TourBookingForm";

type TimeSlotOption = {
  hour: number;
  minute: string;
  period: "AM" | "PM";
};

type TravelerGroup = {
  label: string;
  range: string;
  count: number;
  setter: Dispatch<SetStateAction<number>>;
};

type TourBookingWidgetProps = {
  tourId: string;
  basePrice: number;
  timeSlots: TimeSlotOption[];
};

export function TourBookingWidget({ tourId, basePrice, timeSlots }: TourBookingWidgetProps) {
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [child, setChild] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showTravelersPopover, setShowTravelersPopover] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() =>
    timeSlots.length ? formatTimeOption(timeSlots[0]) : ""
  );

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const totalTravelers = Math.max(1, adults + youth + child);
  const estimatedTotal = basePrice * totalTravelers;

  const handleCheckAvailability = () => {
    if (!date) return;
    setShowDetails(true);
  };

  const travelersSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adult${adults > 1 ? "s" : ""}`);
    if (youth > 0) parts.push(`${youth} youth`);
    if (child > 0) parts.push(`${child} child${child > 1 ? "ren" : ""}`);
    if (!parts.length) return "1 traveler";
    return parts.join(", ");
  };

  const handlePopperToggle = () => {
    setShowTravelersPopover((prev) => !prev);
  };

  const handleApplyTravelers = () => {
    setShowTravelersPopover(false);
  };

  const handleIncrement =
    (setter: Dispatch<SetStateAction<number>>, limit = 15) =>
    () =>
      setter((prev) => Math.min(limit, prev + 1));

  const handleDecrement =
    (setter: Dispatch<SetStateAction<number>>) =>
    () =>
      setter((prev) => Math.max(0, prev - 1));

  useEffect(() => {
    if (!showTravelersPopover) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setShowTravelersPopover(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showTravelersPopover]);

  const travelerGroups: TravelerGroup[] = [
    { label: "Adult", range: "Age 17-99", count: adults, setter: setAdults },
    { label: "Youth", range: "Age 10-16", count: youth, setter: setYouth },
    { label: "Child", range: "Age 1-9", count: child, setter: setChild }
  ];

  return (
    <div className="relative w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      {/* PRICE HEADER */}
      <div className="space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500">From price</p>
        <p className="text-3xl font-semibold text-slate-900">
          ${basePrice.toFixed(2)} <span className="text-xs font-normal text-slate-500">USD</span>
        </p>
        <p className="text-xs text-slate-600">Per person · Instant confirmation</p>
      </div>

      {/* ESTIMATED TOTAL */}
      <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
        <span className="font-semibold">Estimated total:</span> ${estimatedTotal.toFixed(2)} · {totalTravelers} traveler
        {totalTravelers > 1 ? "s" : ""}
      </div>

      {/* DATE + TRAVELERS + START TIME */}
      <div className="rounded-xl border border-slate-200">
      <div className="grid grid-cols-[1.15fr,1fr] divide-x divide-slate-200">
          {/* DATE */}
          <div className="flex flex-col px-4 py-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full border-none bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>

          {/* TRAVELERS */}
          <div className="relative flex flex-col px-4 py-2">
            <button ref={triggerRef} type="button" onClick={handlePopperToggle} className="w-full text-left outline-none">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Travelers</span>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {totalTravelers} traveler{totalTravelers > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500">{travelersSummary()}</p>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-100 px-4 py-2 space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Start time</p>
          {timeSlots.length > 1 ? (
            <select
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
            >
              {timeSlots.map((slot) => (
                <option key={`${slot.hour}-${slot.minute}-${slot.period}`} value={formatTimeOption(slot)}>
                  {formatTimeOption(slot)}
                </option>
              ))}
            </select>
          ) : timeSlots.length === 1 ? (
            <p className="text-xs font-semibold text-slate-900">{formatTimeOption(timeSlots[0])}</p>
          ) : (
            <p className="text-xs text-slate-500">Start time will be confirmed after booking.</p>
          )}
        </div>
      </div>

      {/* Travelers popover */}
      {showTravelersPopover && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 top-[165px] z-[9999] mt-2 w-[300px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Select up to 15 travelers in total.
          </p>

          <div className="mt-3 space-y-3">
            {travelerGroups.map(({ label, range, count, setter }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-[0.65rem] text-slate-500">{range}</p>
                </div>
                <div className="flex items-center gap-3 text-base font-semibold">
                  <button
                    type="button"
                    onClick={handleDecrement(setter)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                  >
                    –
                  </button>
                  <span className="min-w-[24px] text-center">{count}</span>
                  <button
                    type="button"
                    onClick={handleIncrement(setter)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleApplyTravelers}
            className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            Apply
          </button>
        </div>
      )}

      {/* MAIN CTA */}
      <button
        type="button"
        onClick={handleCheckAvailability}
        disabled={!date}
        className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
          date ? "bg-sky-500 hover:bg-sky-600" : "cursor-not-allowed bg-slate-300"
        }`}
      >
        Check availability
      </button>

      {/* BENEFITS */}
      <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs text-slate-800">
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] text-white">
            ✓
          </span>
          <p>
            <span className="font-semibold">Free cancellation</span> up to 24 hours before the experience starts.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[0.65rem] text-white">
            ✓
          </span>
          <p>
            <span className="font-semibold">Reserve now and pay later</span> — secure your spot while staying flexible.
          </p>
        </div>
      </div>

      {/* URGENCY */}
      <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs text-slate-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">🔥</div>
        <div>
          <p className="font-semibold">Book ahead!</p>
          <p>On average, this is booked several days in advance.</p>
        </div>
      </div>

      {/* STEP 2: TRAVELER DETAILS */}
      {showDetails && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Step 2 · Traveler details
          </p>
          <TourBookingForm
            tourId={tourId}
            initialDate={date}
            initialAdults={adults}
            initialChildren={youth + child}
            hideDateAndPax
            selectedTime={selectedTime}
          />
        </div>
      )}
    </div>
  );
}

const formatTimeOption = (slot: TimeSlotOption) => {
  const minute = slot.minute.padStart(2, "0");
  const hour = slot.hour.toString().padStart(2, "0");
  return `${hour}:${minute} ${slot.period}`;
};
