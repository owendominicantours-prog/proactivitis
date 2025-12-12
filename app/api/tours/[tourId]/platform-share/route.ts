import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { tourId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { tourId } = params;
  if (!tourId) {
    return NextResponse.json({ error: "Tour inválido" }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) {
    return NextResponse.json({ error: "Tour no encontrado" }, { status: 404 });
  }
  if (tour.supplierId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso para modificar este tour" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const requested = Number(body.share);
  if (Number.isNaN(requested)) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const normalized = Math.min(Math.max(Math.round(requested), 20), 50);
  await prisma.tour.update({
    where: { id: tourId },
    data: { platformSharePercent: normalized }
  });

  return NextResponse.json({ success: true, platformSharePercent: normalized });
}
