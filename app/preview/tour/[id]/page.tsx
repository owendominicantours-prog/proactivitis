import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TourDetailShell } from "@/components/tours/TourDetailShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vista previa · Proactivitis Tours",
  robots: { index: false, follow: false }
};

export default async function PublicTourPreviewPage({ params }: { params: { id?: string; slug?: string } }) {
  const { id, slug } = params ?? {};
  const lookupId = id ?? slug;
  if (!lookupId) {
    notFound();
  }

  const tour = await prisma.tour.findUnique({
    where: { id: lookupId },
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

  return <TourDetailShell tour={tour} />;
}
