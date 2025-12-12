import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Destinos", href: "/destinations" },
  { label: "Contacto", href: "/contact" }
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: "F" },
  { label: "Instagram", href: "#", icon: "I" },
  { label: "TikTok", href: "#", icon: "T" },
  { label: "X", href: "#", icon: "X" },
  { label: "LinkedIn", href: "#", icon: "in" }
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 text-slate-900"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Proactivitis" width="140" height="32" className="object-contain" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <PublicAuthButtons />
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 md:hidden">
          Navegar:{" "}
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="mr-4 text-slate-600 hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer id="footer" className="border-t border-slate-900 bg-slate-950 px-6 py-10 text-sm text-gray-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 text-xs uppercase tracking-[0.3em] text-gray-400 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[0.55rem] text-slate-400">Idioma</p>
              <select className="w-48 rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white">
                <option>Español</option>
                <option>Inglés</option>
                <option>Portugués</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-[0.55rem] text-slate-400">Moneda</p>
              <select className="w-48 rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>MXN ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-[0.55rem] text-slate-400">Móvil</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white">Disponible en Google Play</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white">Descárgala en App Store</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Soporte</p>
              <Link href="/help-center" className="block text-white transition hover:text-sky-300">
                Centro de ayuda
              </Link>
              <Link href="/contact" className="block text-white transition hover:text-sky-300">
                Contáctanos
              </Link>
              <Link href="/how-it-works" className="block text-white transition hover:text-sky-300">
                Cómo funciona
              </Link>
              <Link href="/faqs" className="block text-white transition hover:text-sky-300">
                Preguntas frecuentes
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Empresa</p>
              <Link href="/about" className="block text-white transition hover:text-sky-300">
                Sobre Proactivitis
              </Link>
              <Link href="/our-mission" className="block text-white transition hover:text-sky-300">
                Nuestra misión
              </Link>
              <Link href="/press" className="block text-white transition hover:text-sky-300">
                Prensa y medios
              </Link>
              <Link href="/partners" className="block text-white transition hover:text-sky-300">
                Aliados
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Colabora</p>
              <Link href="/become-a-supplier" className="block text-white transition hover:text-sky-300">
                Conviértete en supplier
              </Link>
              <Link href="/agency-partners" className="block text-white transition hover:text-sky-300">
                Alianzas con agencias
              </Link>
              <Link href="/affiliates" className="block text-white transition hover:text-sky-300">
                Afiliados
              </Link>
              <Link href="/careers" className="block text-white transition hover:text-sky-300">
                Carreras (próximamente)
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Legal</p>
              <Link href="/legal/terms" className="block text-white transition hover:text-sky-300">
                Términos y condiciones
              </Link>
              <Link href="/legal/privacy" className="block text-white transition hover:text-sky-300">
                Política de privacidad
              </Link>
              <Link href="/legal/cookies" className="block text-white transition hover:text-sky-300">
                Cookies
              </Link>
              <Link href="/legal/information" className="block text-white transition hover:text-sky-300">
                Información legal
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300">
              {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Google Pay"].map((method) => (
                <span key={method} className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-semibold">
                  {method}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xl text-white">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:text-sky-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">
            &copy; {new Date().getFullYear()} Proactivitis
          </p>
        </div>
      </footer>
    </div>
  );
}




