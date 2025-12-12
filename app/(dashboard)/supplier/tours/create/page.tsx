import { prisma } from "@/lib/prisma";
import { SupplierTourCreateForm } from "@/components/supplier/SupplierTourCreateForm";

// Necesitamos datos frescos para el selector de países/destinos
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SupplierTourCreatePage() {
  const countries = await prisma.country.findMany({
    select: { id: true, name: true, slug: true }
  });

  const destinations = await prisma.destination.findMany({
    select: { id: true, name: true, slug: true, countryId: true }
  });

  return (
    <div className="px-4 py-6 md:px-6">
      <SupplierTourCreateForm countries={countries} destinations={destinations} />
    </div>
  );
}
