"use client";



import dynamic from "next/dynamic";

import { ChangeEvent, FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createTourAction } from "@/app/(dashboard)/supplier/tours/actions";

import type { UploadedImage } from "@/components/supplier/MediaUploader";
import { ItineraryTimeline } from "@/components/itinerary/ItineraryTimeline";



const MediaUploader = dynamic(

  () => import("@/components/supplier/MediaUploader").then((mod) => mod.MediaUploader),

  { ssr: false }

);



type Option = { id: string; name: string; slug: string; countryId?: string };

type TimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

type ItineraryStop = { place: string; duration: string; note: string };

type StopDraft = { place: string; note: string };



const STEP_TITLES = [

  "Información general",

  "Precios y disponibilidad",

  "Logística e itinerario",

  "Media y políticas"

];



const LANGUAGE_OPTIONS = [

  "Spanish",

  "English",

  "French",

  "Portuguese",

  "Italian",

  "German",

  "Dutch",

  "Arabic",

  "Russian",

  "Chinese",

  "Japanese"

];



const CATEGORY_OPTIONS = [

  "Aventura",

  "Adrenalina",

  "Aire Libre",

  "Agua",

  "Safari",

  "Cultura",

  "Historia",

  "Gastronom?a",

  "Relajaci?n",

  "Urbano",

  "Nocturno",

  "Traslados"

];



const DAY_OPTIONS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const PICKUP_OPTION_PRESETS = ["Incluye transporte", "No incluye transporte"];

const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const TIME_MINUTE_OPTIONS = ["00", "15", "30", "45"];

const DURATION_UNITS = ["minutos", "horas", "días"];

const PHYSICAL_LEVEL_OPTIONS = ["Easy", "Moderate", "Hard"];

const STORAGE_KEY = "supplier-tour-wizard-draft";

const normalizeSearchTerm = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

type FormAction = (formData: FormData) => Promise<void>;



type SupplierTourCreateFormProps = {

  countries: Option[];

  destinations: Option[];

  action?: FormAction;

  mode?: "create" | "edit";

  initialDraft?: SavedDraft;

  tourId?: string;

};



type TourState = {

  title: string;

  shortDescription: string;

  description: string;

  price: string;

  priceChild: string;

  priceYouth: string;

  capacity: string;

  confirmationType: "instant" | "manual";

  country: string;

  destination: string;

  location: string;

  notes: string;

  pickup: string;

  pickupNotes: string;

  pickupOptions: string[];

  requirements: string;

  cancellation: "flexible" | "no-refund";

  terms: string;

  minAge: string;

  physicalLevel: "Easy" | "Moderate" | "Hard" | "";

  meetingPoint: string;

  meetingInstructions: string;

};



const baseInputClass =

  "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400";

const baseTextareaClass =

  "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400";



const INSTRUCTION_PRESETS = [
  "Llegar 15 minutos antes",
  "Llegar 30 minutos antes",
  "Llegar 40 minutos antes",
  "Llegar 1 hora antes"
];

const defaultState: TourState = {

  title: "",

  shortDescription: "",

  description: "",

  price: "",

  priceChild: "",

  priceYouth: "",

  capacity: "1",

  confirmationType: "instant",

  country: "",

  destination: "",

  location: "",

  notes: "",

  pickup: "",

  pickupNotes: "",

  pickupOptions: [],

  requirements: "",

  cancellation: "flexible",

  terms: "",

  minAge: "",

  physicalLevel: "",

  meetingPoint: "",

  meetingInstructions: ""

};



const defaultTimeSlot: TimeSlot = { hour: 8, minute: "00", period: "AM" };



type SectionCardProps = {

  title: string;

  description?: string;

  children: ReactNode;

};



const SectionCard = ({ title, description, children }: SectionCardProps) => (

  <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

    <div>

      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      {description && <p className="text-sm text-slate-500">{description}</p>}

    </div>

    <div className="space-y-4">{children}</div>

  </section>

);



type SavedState = TourState & Partial<Record<"includes" | "excludes", string>>;

export type SavedDraft = {

  state?: SavedState;

  languages?: string[];

  categories?: string[];

  timeSlots?: TimeSlot[];

  daySelection?: string[];

  blackoutDates?: string[];

  itineraryStops?: ItineraryStop[];

  pickupOptions?: string[];

  duration?: { value: string; unit: string };

  heroImage?: UploadedImage | null;

  galleryImages?: UploadedImage[];

};



export function SupplierTourCreateForm({

  countries,

  destinations,

  action,

  mode = "create",

  initialDraft,

  tourId

}: SupplierTourCreateFormProps) {

  const [step, setStep] = useState(0);

  const [state, setState] = useState<TourState>(() => {

    const initial = { ...defaultState, ...(initialDraft?.state ?? {}) };

    initial.location = initial.destination;

    return initial;

  });

  const [languages, setLanguages] = useState<string[]>(initialDraft?.languages ?? []);

  const [categories, setCategories] = useState<string[]>(initialDraft?.categories ?? []);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => initialDraft?.timeSlots ?? [defaultTimeSlot]);

  const [daySelection, setDaySelection] = useState<string[]>(initialDraft?.daySelection ?? []);

  const [blackoutDates, setBlackoutDates] = useState<string[]>(initialDraft?.blackoutDates ?? []);

  const [blackoutDateInput, setBlackoutDateInput] = useState("");

  const [itineraryStops, setItineraryStops] = useState<ItineraryStop[]>(initialDraft?.itineraryStops ?? []);
  const timelineStops = useMemo(
    () =>
      itineraryStops.map((stop) => ({
        label: stop.place || "Parada",
        description: stop.note || undefined,
        duration: stop.duration || undefined
      })),
    [itineraryStops]
  );

  const [stopDraft, setStopDraft] = useState<StopDraft>({ place: "", note: "" });

  const [durationValue, setDurationValue] = useState(initialDraft?.duration?.value ?? "8");

  const [durationUnit, setDurationUnit] = useState(initialDraft?.duration?.unit ?? "horas");

  const [stopDurationValue, setStopDurationValue] = useState("1");

  const [stopDurationUnit, setStopDurationUnit] = useState("horas");

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const [dayMenuOpen, setDayMenuOpen] = useState(false);

  const [instructionMenuOpen, setInstructionMenuOpen] = useState(false);

  const [pickupMenuOpen, setPickupMenuOpen] = useState(false);

  const [pickupOptions, setPickupOptions] = useState<string[]>(initialDraft?.pickupOptions ?? []);

  const languageMenuRef = useRef<HTMLDivElement | null>(null);

  const categoryMenuRef = useRef<HTMLDivElement | null>(null);

  const dayMenuRef = useRef<HTMLDivElement | null>(null);

  const instructionMenuRef = useRef<HTMLDivElement | null>(null);

  const pickupMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (categoryMenuOpen && categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
      if (languageMenuOpen && languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
      if (dayMenuOpen && dayMenuRef.current && !dayMenuRef.current.contains(event.target as Node)) {
        setDayMenuOpen(false);
      }
      if (instructionMenuOpen && instructionMenuRef.current && !instructionMenuRef.current.contains(event.target as Node)) {
        setInstructionMenuOpen(false);
      }
      if (pickupMenuOpen && pickupMenuRef.current && !pickupMenuRef.current.contains(event.target as Node)) {
        setPickupMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [categoryMenuOpen, languageMenuOpen, dayMenuOpen, instructionMenuOpen, pickupMenuOpen]);

  const [heroImage, setHeroImage] = useState<UploadedImage | null>(initialDraft?.heroImage ?? null);

  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>(initialDraft?.galleryImages ?? []);

  const formAction = action ?? createTourAction;

  const shouldPersistDraft = mode === "create";

  const shouldLoadLocalDraft = shouldPersistDraft && !initialDraft;

  const [submitting, setSubmitting] = useState(false);

  const findCountryByInput = useCallback(
    (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return undefined;
      const normalizedInput = normalizeSearchTerm(trimmedInput);
      return countries.find((country) => {
        if (normalizeSearchTerm(country.name) === normalizedInput) {
          return true;
        }
        if (country.slug && normalizeSearchTerm(country.slug) === normalizedInput) {
          return true;
        }
        if (country.id === trimmedInput) {
          return true;
        }
        return false;
      });
    },
    [countries]
  );

  const filteredDestinations = useMemo(() => {

    const matchedCountry = findCountryByInput(state.country);

    if (!matchedCountry) {

      return state.country.trim() ? [] : destinations;

    }

    return destinations.filter((destination) => destination.countryId === matchedCountry.id);

  }, [state.country, destinations, findCountryByInput]);



  useEffect(() => {

    if (!shouldLoadLocalDraft) return;

    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    let cancelled = false;

    try {

      const parsed = JSON.parse(saved) as SavedDraft;

      queueMicrotask(() => {

        if (cancelled) return;

        if (parsed.state) {

          setState((prev) => {

            const merged = { ...prev, ...parsed.state };

            merged.location = merged.destination;

            return merged;

          });

        }

        setLanguages(parsed.languages ?? []);

        setCategories(parsed.categories ?? []);

        setTimeSlots(parsed.timeSlots ?? [defaultTimeSlot]);

        setDaySelection(parsed.daySelection ?? []);

        setBlackoutDates(parsed.blackoutDates ?? []);

        setItineraryStops(parsed.itineraryStops ?? []);

        if (parsed.duration?.value) {

          setDurationValue(parsed.duration.value);

        }

        if (parsed.duration?.unit) {

          setDurationUnit(parsed.duration.unit);

        }

        if ("heroImage" in parsed) {

          setHeroImage(parsed.heroImage ?? null);

        }

        if ("galleryImages" in parsed && Array.isArray(parsed.galleryImages)) {

          setGalleryImages(parsed.galleryImages);

        }

      });

    } catch {

      // ignore

    }

    return () => {

      cancelled = true;

    };

  }, [shouldLoadLocalDraft]);



  useEffect(() => {

    if (!shouldPersistDraft) return;

    if (typeof window === "undefined") return;

    window.localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify({

        state,

        languages,

        categories,

        timeSlots,

        daySelection,

        blackoutDates,

        itineraryStops,

        heroImage,

        galleryImages,

        pickupOptions,

        duration: { value: durationValue, unit: durationUnit }

      })

    );

  }, [

    shouldPersistDraft,

    state,

    languages,

    categories,

    timeSlots,

    daySelection,

    blackoutDates,

    itineraryStops,

    durationValue,

    durationUnit,

    heroImage,

    galleryImages,

    pickupOptions

  ]);

  const updateField = <K extends keyof TourState>(key: K, value: TourState[K]) => {

    setState((prev) => {

      const nextState = { ...prev, [key]: value };

      if (key === "country") {
        const nextCountry = (value as string).trim();
        if (!nextCountry) {
          nextState.destination = "";
          return nextState;
        }
        const matchedCountry = findCountryByInput(nextCountry);
        if (!matchedCountry) {
          nextState.destination = "";
          return nextState;
        }
        if (!nextState.destination) {
          return nextState;
        }
        const normalizedDestination = normalizeSearchTerm(nextState.destination);
        const allowedDestinations = destinations.filter(
          (destination) => destination.countryId === matchedCountry.id
        );
        const destinationMatches = allowedDestinations.some((destination) => {
          if (normalizeSearchTerm(destination.name) === normalizedDestination) {
            return true;
          }
          if (destination.slug && normalizeSearchTerm(destination.slug) === normalizedDestination) {
            return true;
          }
          if (destination.id === nextState.destination.trim()) {
            return true;
          }
          return false;
        });
        if (!destinationMatches) {
          nextState.destination = "";
        }
      }
      if (key === "country" || key === "destination") {
        nextState.location = nextState.destination;
      }

      return nextState;

    });

  };




  const toggleLanguage = (value: string) => {

    setLanguages((prev) =>

      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]

    );

  };



  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };



  const toggleDay = (value: string) => {

    setDaySelection((prev) =>

      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]

    );

  };

  const selectAllDays = () => {

    setDaySelection(DAY_OPTIONS);

  };

  const applyInstructionPreset = (preset: string) => {
    updateField("meetingInstructions", preset);
    setInstructionMenuOpen(false);
  };

  const handlePickupOptionSelect = (value: string) => {
    setPickupOptions([value]);
    updateField("pickup", value);
    setPickupMenuOpen(false);
  };

  const addBlackoutDate = () => {
    if (!blackoutDateInput) return;
    if (blackoutDates.includes(blackoutDateInput)) return;
    setBlackoutDates((prev) => [...prev, blackoutDateInput].sort());
    setBlackoutDateInput("");
  };

  const removeBlackoutDate = (date: string) => {
    setBlackoutDates((prev) => prev.filter((item) => item !== date));
  };



  const addTimeSlot = () => {

    setTimeSlots((prev) => [...prev, defaultTimeSlot]);

  };



  const updateTimeSlot = (index: number, slot: Partial<TimeSlot>) => {

    setTimeSlots((prev) =>

      prev.map((item, idx) => (idx === index ? { ...item, ...slot } : item))

    );

  };



  const removeTimeSlot = (index: number) => {

    setTimeSlots((prev) => (prev.length === 1 ? [defaultTimeSlot] : prev.filter((_, idx) => idx !== index)));

  };



  const handleAddStop = () => {

    const formattedDuration = stopDurationValue ? `${stopDurationValue} ${stopDurationUnit}` : "";

    if (!stopDraft.place && !formattedDuration && !stopDraft.note) return;

    setItineraryStops((prev) => [...prev, { ...stopDraft, duration: formattedDuration }]);

    setStopDraft({ place: "", note: "" });

    setStopDurationValue("1");

    setStopDurationUnit("horas");

  };



  const removeStop = (index: number) => {

    setItineraryStops((prev) => prev.filter((_, idx) => idx !== index));

  };





  const formatSlot = (slot: TimeSlot) => `${slot.hour.toString().padStart(2, "0")}:${slot.minute} ${slot.period}`;



  const handleNext = () => setStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {

    setSubmitting(true);

    if (shouldPersistDraft && typeof window !== "undefined") {

      window.localStorage.removeItem(STORAGE_KEY);

    }

  };



  const stepContent = () => {

    switch (step) {

      case 0:

        return (

          <>

            <SectionCard title="Resumen principal" description="Dale vida al tour con un nombre claro y una descripción completa.">

              <div className="grid gap-4 md:grid-cols-2">

                <label>

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Título</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F1

                    </span>

                  </span>

                  <input

                    name="title"

                    value={state.title}

                    onChange={(event) => updateField("title", event.target.value)}

                    className={baseInputClass}

                    placeholder="Safari Proactivitis en Punta Cana"

                    required

                  />

                </label>

              </div>

              <div className="mt-4">

                <label className="space-y-2">

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Categorías</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F2

                    </span>

                  </span>

                  <div className="relative" ref={categoryMenuRef}>

                    <button

                      type="button"

                      onClick={() => setCategoryMenuOpen((prev) => !prev)}

                      className={`${baseInputClass} flex items-center justify-between`}

                    >

                      <span className="truncate text-slate-600">

                        {categories.length ? categories.join(", ") : "Selecciona categorías"}

                      </span>

                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">

                        ▼

                      </span>

                    </button>

                    {categoryMenuOpen && (

                      <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">

                        {CATEGORY_OPTIONS.map((cat) => (

                          <label key={cat} className="flex items-center gap-2 px-3 py-2 text-sm">

                            <input

                              type="checkbox"

                              checked={categories.includes(cat)}

                              onChange={() => toggleCategory(cat)}

                              className="h-4 w-4 rounded border-slate-300 text-sky-600"

                            />

                            <span>{cat}</span>

                          </label>

                        ))}

                      </div>

                    )}

                  </div>

                  <p className="text-[0.7rem] text-slate-500">

                    Haz clic para desplegar la lista y selecciona todas las categorías que apliquen.

                  </p>

                </label>

              </div>

              <div>

                <label className="text-xs font-semibold text-slate-700">

                  Descripción corta

                  <textarea

                    name="shortDescription"

                    value={state.shortDescription}

                    onChange={(event) => updateField("shortDescription", event.target.value)}

                    className={baseTextareaClass}

                    rows={2}

                    placeholder="Resumen rápido para listados."

                  />

                </label>

              </div>

              <div>

                <label className="text-xs font-semibold text-slate-700">

                  Descripción larga

                  <textarea

                    name="description"

                    value={state.description}

                    onChange={(event) => updateField("description", event.target.value)}

                    className={baseTextareaClass}

                    rows={4}

                    placeholder="Cuenta la experiencia completa, logística, qué verán."

                  />

                </label>

              </div>

            </SectionCard>



            <SectionCard title="Detalles operativos">

              <div className="grid gap-4 md:grid-cols-1">

                <label className="space-y-2">

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Idiomas</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F5

                    </span>

                  </span>

                  <div className="relative" ref={languageMenuRef}>

                    <button

                      type="button"

                      onClick={() => setLanguageMenuOpen((prev) => !prev)}

                      className={`${baseInputClass} flex items-center justify-between`}

                    >

                      <span className="truncate">{languages.length ? languages.join(", ") : "Selecciona idiomas"}</span>

                      <svg className="h-4 w-4 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor">

                        <path d="M4 6l4 4 4-4" strokeWidth="2" strokeLinecap="round" />

                      </svg>

                    </button>

                    {languageMenuOpen && (

                      <div className="absolute z-10 mt-1 max-h-44 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">

                        {LANGUAGE_OPTIONS.map((lang) => (

                          <label key={lang} className="flex items-center gap-2 px-3 py-2 text-sm">

                            <input

                              type="checkbox"

                              checked={languages.includes(lang)}

                              onChange={() => toggleLanguage(lang)}

                              className="h-4 w-4 rounded border-slate-300 text-sky-600"

                            />

                            <span>{lang}</span>

                          </label>

                        ))}

                      </div>

                    )}

                  </div>

                  <p className="text-[0.7rem] text-slate-500">

                    Haz clic para desplegar la lista y selecciona los idiomas que manejas.

                  </p>

                </label>

                <label>

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Duración</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F6

                    </span>

                  </span>

                  <div className="flex gap-2">

                    <select

                      value={durationValue}

                      onChange={(event) => setDurationValue(event.target.value)}

                      className={baseInputClass}

                    >

                      {Array.from({ length: 60 }, (_, index) => index + 1).map((number) => (

                        <option key={number} value={number.toString()}>

                          {number}

                        </option>

                      ))}

                    </select>

                    <select

                      value={durationUnit}

                      onChange={(event) => setDurationUnit(event.target.value)}

                      className={baseInputClass}

                    >

                      {["minutos", "horas", "días"].map((unit) => (

                        <option key={unit} value={unit}>

                          {unit}

                        </option>

                      ))}

                    </select>

                  </div>

                  <p className="text-[0.6rem] text-slate-500">

                    Elige una duración del 1 al 60 y selecciona la unidad al lado.

                  </p>

                </label>

                <label>

                  <span>Nivel físico</span>

                  <select

                    name="physicalLevel"

                    value={state.physicalLevel}

                    onChange={(event) => updateField("physicalLevel", event.target.value as "Easy" | "Moderate" | "Hard" | "")}

                    className={baseInputClass}

                  >

                    <option value="">Selecciona nivel</option>

                    {PHYSICAL_LEVEL_OPTIONS.map((level) => (

                      <option key={level} value={level}>

                        {level}

                      </option>

                    ))}

                  </select>

                </label>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <label>

                  <span>Edad mínima</span>

                  <input

                    type="number"

                    min={0}

                    value={state.minAge}

                    onChange={(event) => updateField("minAge", event.target.value)}

                    className={baseInputClass}

                    placeholder="5"

                  />

                </label>

              </div>

            </SectionCard>



            <SectionCard title="País y destino" description="Selecciona el país y solo verás las zonas de ese destino.">

              <div className="grid gap-4 md:grid-cols-2">

                <label>

                  <span>País</span>

                  <input

                    list="country-list"

                    name="country"

                    value={state.country}

                    onChange={(event) => updateField("country", event.target.value)}

                    className={baseInputClass}

                    placeholder="Dominican Republic"

                  />

                  <datalist id="country-list">

                    {countries.map((country) => (

                      <option key={country.id} value={country.name} />

                    ))}

                  </datalist>

                </label>

                <label>

                  <span>Destino / Zona</span>

                  <input

                    list="destination-list"

                    name="destination"

                    value={state.destination}

                    onChange={(event) => updateField("destination", event.target.value)}

                    className={baseInputClass}

                    placeholder="Punta Cana"

                  />

                  <datalist id="destination-list">

                    {filteredDestinations.map((destination) => (

                      <option key={destination.id} value={destination.name} />

                    ))}

                  </datalist>

                </label>

              </div>

            </SectionCard>

          </>

        );

      case 1:

        return (

          <>

            <SectionCard title="Precios y cupo">

              <div className="grid gap-4 md:grid-cols-4">

                <label>

                  <span>Precio adulto (USD)</span>

                  <input

                    type="number"

                    min={0}

                    step="0.01"

                    name="price"

                    value={state.price}

                    onChange={(event) => updateField("price", event.target.value)}

                    className={baseInputClass}

                    placeholder="140"

                  />

                </label>

                <label>

                  <span>Precio niño</span>

                  <input

                    type="number"

                    min={0}

                    step="0.01"

                    name="priceChild"

                    value={state.priceChild}

                    onChange={(event) => updateField("priceChild", event.target.value)}

                    className={baseInputClass}

                    placeholder="90"

                  />

                </label>

                <label>

                  <span>Precio youth</span>

                  <input

                    type="number"

                    min={0}

                    step="0.01"

                    name="priceYouth"

                    value={state.priceYouth}

                    onChange={(event) => updateField("priceYouth", event.target.value)}

                    className={baseInputClass}

                    placeholder="110"

                  />

                </label>

                <label>

                  <span>Cupo máximo</span>

                  <input

                    type="number"

                    min={1}

                    name="capacity"

                    value={state.capacity}

                    onChange={(event) => updateField("capacity", event.target.value)}

                    className={baseInputClass}

                    placeholder="50"

                  />

                </label>

              </div>

            </SectionCard>



            <SectionCard title="Disponibilidad">

              <div className="grid gap-4 md:grid-cols-2">

                <label className="space-y-2">

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Días operativos</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F15

                    </span>

                  </span>

                  <div className="relative" ref={dayMenuRef}>

                    <button

                      type="button"

                      onClick={() => setDayMenuOpen((prev) => !prev)}

                      className={`${baseInputClass} flex items-center justify-between`}

                    >

                      <span className="truncate text-slate-600">

                        {daySelection.length ? daySelection.join(", ") : "Selecciona días"}

                      </span>

                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">

                        ⌄

                      </span>

                    </button>

                    {dayMenuOpen && (

                      <div className="absolute z-10 mt-1 w-full max-h-[18rem] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">

                        <button

                          type="button"

                          onClick={selectAllDays}

                          className="w-full border-b border-slate-100 bg-slate-50/80 px-3 py-2 text-left text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sky-600 transition hover:bg-slate-100"

                        >

                          Seleccionar todo

                        </button>

                        {DAY_OPTIONS.map((day) => (

                          <label key={day} className="flex items-center gap-2 px-3 py-2 text-sm">

                            <input

                              type="checkbox"

                              checked={daySelection.includes(day)}

                              onChange={() => toggleDay(day)}

                              className="h-4 w-4 rounded border-slate-300 text-sky-600"

                            />

                            <span>{day}</span>

                          </label>

                        ))}

                      </div>

                    )}

                  </div>

                </label>

                <label className="space-y-2">

                  <span>Fechas bloqueadas</span>

                  <div className="flex flex-wrap gap-2">

                    <input

                      type="date"

                      value={blackoutDateInput}

                      onChange={(event) => setBlackoutDateInput(event.target.value)}

                      className={baseInputClass}

                    />

                    <button

                      type="button"

                      onClick={addBlackoutDate}

                      className="rounded-xl border border-slate-200 bg-sky-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-700"

                    >

                      Agregar

                    </button>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {blackoutDates.map((date) => (

                      <span

                        key={date}

                        className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] text-slate-700"

                      >

                        {new Date(date).toLocaleDateString("en-CA")}

                        <button

                          type="button"

                          onClick={() => removeBlackoutDate(date)}

                          aria-label={`Eliminar ${date}`}

                          className="text-slate-400 transition hover:text-slate-700"

                        >

                          ×

                        </button>

                      </span>

                    ))}

                  </div>

                </label>

              </div>

              <div className="space-y-3">

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">

                  Horarios estructurados

                </p>

                <div className="space-y-2">

                  {timeSlots.map((slot, index) => (

                    <div

                      key={`slot-${index}`}

                      className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"

                    >

                      <select

                        value={slot.hour}

                        onChange={(event) => updateTimeSlot(index, { hour: Number(event.target.value) })}

                        className={`${baseInputClass} w-20`}

                      >

                        {TIME_HOUR_OPTIONS.map((hour) => (

                          <option key={`hour-${hour}`} value={hour}>

                            {hour}

                          </option>

                        ))}

                      </select>

                      <select

                        value={slot.minute}

                        onChange={(event) => updateTimeSlot(index, { minute: event.target.value })}

                        className={`${baseInputClass} w-20`}

                      >

                        {TIME_MINUTE_OPTIONS.map((minute) => (

                          <option key={`minute-${minute}`} value={minute}>

                            {minute}

                          </option>

                        ))}

                      </select>

                      <select

                        value={slot.period}

                        onChange={(event) => updateTimeSlot(index, { period: event.target.value as "AM" | "PM" })}

                        className={`${baseInputClass} w-24`}

                      >

                        <option value="AM">AM</option>

                        <option value="PM">PM</option>

                      </select>

                      <button type="button" onClick={() => removeTimeSlot(index)} className="text-red-500 hover:text-red-700">

                        Eliminar

                      </button>

                    </div>

                  ))}

                  <button

                    type="button"

                    onClick={addTimeSlot}

                    className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"

                  >

                    Agregar horario

                  </button>

                </div>

              </div>

            </SectionCard>



          </>

        );

      case 2:

        return (

          <>

            <SectionCard title="Meeting & pickup" description="Define puntos de encuentro y recogidas opcionales.">

              <div className="grid gap-4 md:grid-cols-2">

                <label>

                  <span>Meeting point</span>

                  <input

                    name="meetingPoint"

                    value={state.meetingPoint}

                    onChange={(event) => updateField("meetingPoint", event.target.value)}

                    className={baseInputClass}

                    placeholder="Punto de encuentro / hotel"

                  />

                </label>

                <label className="space-y-2">

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Instrucciones</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F21

                    </span>

                  </span>

                  <div className="relative" ref={instructionMenuRef}>

                    <button

                      type="button"

                      onClick={() => setInstructionMenuOpen((prev) => !prev)}

                      className={`${baseInputClass} flex items-center justify-between`}

                    >

                      <span className="truncate text-slate-600">

                        {state.meetingInstructions ? state.meetingInstructions : "Selecciona una sugerencia..."}

                      </span>

                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">

                        ▼

                      </span>

                    </button>

                    {instructionMenuOpen && (

                      <div className="absolute z-10 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">

                        {INSTRUCTION_PRESETS.map((preset) => (

                          <button

                            key={preset}

                            type="button"

                            onClick={() => applyInstructionPreset(preset)}

                            className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"

                          >

                            {preset}

                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                </label>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <label className="space-y-2">

                  <span className="flex items-center gap-1 text-slate-900">

                    <span>Pickup (opcional)</span>

                    <span className="rounded-full border border-slate-300 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">

                      F22

                    </span>

                  </span>

                  <div className="relative" ref={pickupMenuRef}>

                    <button

                      type="button"

                      onClick={() => setPickupMenuOpen((prev) => !prev)}

                      className={`${baseInputClass} flex items-center justify-between`}

                    >

                      <span className="truncate text-slate-600">

                        {pickupOptions.length ? pickupOptions[0] : "Selecciona si incluye transporte"}

                      </span>

                      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">

                        ▼

                      </span>

                    </button>

                    {pickupMenuOpen && (

                      <div className="absolute z-10 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">

                        {PICKUP_OPTION_PRESETS.map((option) => (

                          <button

                            key={option}

                            type="button"

                            onClick={() => handlePickupOptionSelect(option)}

                            className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"

                          >

                            {option}

                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                </label>

                <label>

                  <span>Hoteles y zonas de pickup</span>

                  <textarea

                    name="pickupNotes"

                    rows={2}

                    value={state.pickupNotes}

                    onChange={(event) => updateField("pickupNotes", event.target.value)}

                    className={baseTextareaClass}

                    placeholder="Lista de hoteles o zonas específicas."

                  />

                </label>

              </div>

            </SectionCard>



            <SectionCard title="Itinerario" description="Agrega paradas con duraciones en horas, minutos o días.">

              <div className="grid gap-4 md:grid-cols-3">

                <input

                  value={stopDraft.place}

                  onChange={(event) => setStopDraft((prev) => ({ ...prev, place: event.target.value }))}

                  className={baseInputClass}

                  placeholder="Lugar"

                />

                <div className="flex gap-2">

                  <input

                    type="number"

                    min={0}

                    step={1}

                    aria-label="Cantidad de duración"

                    value={stopDurationValue}

                    onChange={(event) => setStopDurationValue(event.target.value.replace(/[^0-9]/g, ""))}

                    className={`${baseInputClass} text-right`}

                    placeholder="Cantidad"

                  />

                  <select

                    value={stopDurationUnit}

                    onChange={(event) => setStopDurationUnit(event.target.value)}

                    className={`${baseInputClass} w-32`}

                  >

                    {DURATION_UNITS.map((unit) => (

                      <option key={`stop-duration-${unit}`} value={unit}>

                        {unit}

                      </option>

                    ))}

                  </select>

                </div>

                <input

                  value={stopDraft.note}

                  onChange={(event) => setStopDraft((prev) => ({ ...prev, note: event.target.value }))}

                  className={baseInputClass}

                  placeholder="Descripción"

                />

              </div>

              <p className="text-xs text-slate-500">
                Indica la cantidad y unidad (horas/minutos/días) antes de sumar la parada.
              </p>

              <button

                type="button"

                onClick={handleAddStop}

                className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"

              >

                Agregar parada

              </button>

              <div className="space-y-2">

                {itineraryStops.map((stop, index) => (

                  <div

                    key={`stop-${index}`}

                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm md:flex-row md:items-center md:justify-between"

                  >

                    <div>

                      <p className="font-semibold">

                        {stop.place} · {stop.duration || "Sin duración"}

                      </p>

                      <p className="text-xs text-slate-500">{stop.note}</p>

                    </div>

                    <button type="button" onClick={() => removeStop(index)} className="text-red-500 hover:text-red-700">

                      Eliminar

                    </button>

                  </div>

                ))}

              </div>

              {timelineStops.length > 0 && (
                <div className="mt-6">
                  <ItineraryTimeline
                    stops={timelineStops}
                    startDescription={
                      state.meetingPoint ? `Encuentro en ${state.meetingPoint}.` : undefined
                    }
                    finishDescription={
                      state.meetingInstructions || "Regresamos al punto de partida."
                    }
                  />
                </div>
              )}

            </SectionCard>

          </>

        );

      case 3:

        return (

          <>



            <SectionCard title="Políticas y requisitos">

              <label>

                <span>Requisitos y restricciones</span>

                <textarea

                  name="requirements"

                  rows={3}

                  value={state.requirements}

                  onChange={(event) => updateField("requirements", event.target.value)}

                  className={baseTextareaClass}

                  placeholder="Qué llevar, condiciones físicas, etc."

                />

              </label>

              <div className="grid gap-4 md:grid-cols-2">

                <label>

                  <span>Cancelación</span>

                  <select

                    name="cancellation"

                    value={state.cancellation}

                    onChange={(event) => updateField("cancellation", event.target.value as "flexible" | "no-refund")}

                    className={baseInputClass}

                  >

                    <option value="flexible">Flexible</option>

                    <option value="no-refund">Sin reembolso</option>

                  </select>

                </label>

                <label>

                  <span>Condiciones</span>

                  <textarea

                    name="terms"

                    rows={2}

                    value={state.terms}

                    onChange={(event) => updateField("terms", event.target.value)}

                    className={baseTextareaClass}

                    placeholder="Reglas y condiciones automáticas"

                  />

                </label>

              </div>

            </SectionCard>



            <SectionCard title="Media">

              <div className="space-y-3">

                <MediaUploader

                  minGallery={7}

                  maxGallery={20}

                  hero={heroImage}

                  gallery={galleryImages}

                  onHeroChange={(image) => setHeroImage(image)}

                  onGalleryChange={(items) => setGalleryImages(items)}

                />

              </div>

            </SectionCard>

          </>

        );

      default:

        return null;

    }

  };



  return (

    <form

      action={formAction}

      onSubmit={handleFormSubmit}

      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"

    >

      <div className="space-y-2">

        <div className="flex flex-wrap gap-2">

          {STEP_TITLES.map((title, index) => (

            <button

              type="button"

              key={title}

              onClick={() => setStep(index)}

              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${

                index === step ? "bg-sky-600 text-white" : "border border-slate-200 text-slate-500 hover:border-slate-400"

              }`}

            >

              {title}

            </button>

          ))}

        </div>

        <p className="text-sm text-slate-500">

          Paso {step + 1} de {STEP_TITLES.length}

        </p>

      </div>



      {stepContent()}



      {mode === "edit" && tourId && (

        <input type="hidden" name="tourId" value={tourId} />

      )}

      {step === STEP_TITLES.length - 1 && (

        <>

          <input type="hidden" name="title" value={state.title} />

          <input type="hidden" name="shortDescription" value={state.shortDescription} />

          <input type="hidden" name="description" value={state.description} />

          <input type="hidden" name="location" value={state.location} />

          <input type="hidden" name="minAge" value={state.minAge} />

          <input type="hidden" name="physicalLevel" value={state.physicalLevel} />

          <input type="hidden" name="country" value={state.country} />

          <input type="hidden" name="destination" value={state.destination} />

          <input type="hidden" name="price" value={state.price} />

          <input type="hidden" name="priceChild" value={state.priceChild} />

          <input type="hidden" name="priceYouth" value={state.priceYouth} />

          <input type="hidden" name="capacity" value={state.capacity} />

          <input type="hidden" name="meetingPoint" value={state.meetingPoint} />

          <input type="hidden" name="meetingInstructions" value={state.meetingInstructions} />

          <input type="hidden" name="pickup" value={state.pickup} />

          <input type="hidden" name="pickupNotes" value={state.pickupNotes} />

        </>

      )}

      {languages.map((language) => (
        <input key={`hidden-language-${language}`} type="hidden" name="languages" value={language} />
      ))}

      {categories.map((category) => (
        <input key={`hidden-category-${category}`} type="hidden" name="categories" value={category} />
      ))}

      {pickupOptions.map((option) => (
        <input key={`hidden-pickup-${option}`} type="hidden" name="pickupOptions" value={option} />
      ))}

      <input type="hidden" name="operatingDays" value={JSON.stringify(daySelection)} />

      <input type="hidden" name="timeSlots" value={JSON.stringify(timeSlots)} />

      <input type="hidden" name="blackoutDates" value={JSON.stringify(blackoutDates)} />

      <input type="hidden" name="itineraryStops" value={JSON.stringify(itineraryStops)} />

      <input type="hidden" name="duration" value={JSON.stringify({ value: durationValue, unit: durationUnit })} />

      {heroImage && <input type="hidden" name="heroImageUrl" value={heroImage.url} />}

      {galleryImages.map((item, index) => (

        <input

          key={`gallery-hidden-${item.url}-${index}`}

          type="hidden"

          name="galleryUrls"

          value={item.url}

        />

      ))}



      <div className="flex items-center justify-between pt-4">

        <button

          type="button"

          onClick={handlePrev}

          disabled={step === 0}

          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40"

        >

          Anterior

        </button>

        {step < STEP_TITLES.length - 1 ? (

          <button

            type="button"

            onClick={handleNext}

            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"

          >

            Siguiente

          </button>

        ) : (

          <div className="flex flex-col items-end gap-2">

            <div className="text-xs text-slate-500">

              El tour se enviará directamente para aprobación; no se guarda como borrador.

            </div>

            <button

              type="submit"

              disabled={submitting}

              className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm ${

                submitting ? "bg-emerald-500 opacity-70" : "bg-green-600 hover:bg-green-700"

              }`}

            >

              {submitting ? "Enviando..." : "Enviar"}

            </button>

          </div>

        )}

      </div>

    </form>

  );

}
