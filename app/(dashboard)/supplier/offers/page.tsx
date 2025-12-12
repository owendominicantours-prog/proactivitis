import { createSupplierOfferAction } from "@/app/(dashboard)/supplier/offers/actions";

export default function SupplierOffersPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl rounded-[32px] bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Ofertas del supplier</h1>
        <form action={createSupplierOfferAction} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Tour ID
            <input
              name="tourId"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
              placeholder="saona"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Título
            <input
              name="title"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
              placeholder="Oferta flash"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Descripción
            <textarea
              name="description"
              rows={3}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
            />
          </label>
          <button className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white">
            Crear oferta
          </button>
        </form>
      </div>
    </div>
  );
}
