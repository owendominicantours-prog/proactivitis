import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  action?: (formData: FormData) => Promise<void>;
};

export function TourEditorShell({ title, children, action }: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Supplier panel</p>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        </div>
        <button
          type="submit"
          form="tour-editor"
          className="rounded-md bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow"
        >
          Guardar borrador
        </button>
      </header>
      <form
        id="tour-editor"
        action={action}
        method="post"
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {children}
      </form>
    </div>
  );
}
