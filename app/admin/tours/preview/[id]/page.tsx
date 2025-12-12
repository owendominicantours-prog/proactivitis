import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TourDetailShell } from "@/components/tours/TourDetailShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preview interno de tour · Proactivitis",
  robots: { index: false, follow: false }
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  under_review: "En revisión",
  pending: "Pendiente",
  needs_changes: "Necesita cambios",
  published: "Publicado",
  paused: "Pausado"
};

export default async function AdminTourPreviewPage({ params }: { params: { id?: string } }) {
  if (!params?.id) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      supplier: {
        include: {
          user: true
        }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";
  const isSupplierOwner =
    session.user.role === "SUPPLIER" && session.user.id && tour.supplier.userId === session.user.id;
  if (!isAdmin && !isSupplierOwner) {
    notFound();
  }

  const statusLabel = statusLabels[tour.status] ?? tour.status;

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
        Estás viendo una vista previa interna del tour tal como lo verá el cliente. Estado actual: {statusLabel}
      </div>
      <TourDetailShell tour={tour} />
    </>
  );
}
