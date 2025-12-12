import Link from "next/link";

export const Footer = () => (
  <footer className="w-full border-t border-slate-200 bg-white/80 py-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} Owen Dominicanproactivitis Limited</p>
      <div className="flex gap-4">
        <Link href="/privacy" className="hover:text-brand">
          Privacidad
        </Link>
        <Link href="/terms" className="hover:text-brand">
          Términos
        </Link>
      </div>
    </div>
  </footer>
);
