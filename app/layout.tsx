import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Open_Sans } from "next/font/google";
import { Providers } from "./providers";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Proactivitis Marketplace",
  description:
    "Marketplace turístico integral de Owen Dominicanproactivitis - tours, proveedores, agencias y CRM en un solo lugar."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={openSans.variable}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
