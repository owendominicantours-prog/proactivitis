import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const where = query
    ? {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { customerName: { contains: query, mode: "insensitive" } },
          { customerEmail: { contains: query, mode: "insensitive" } }
        ]
      }
    : undefined;

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: query ? 10 : 5,
    include: {
      Tour: {
        select: {
          title: true
        }
      }
    }
  });

  const payload = bookings.map((booking) => ({
    id: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    travelDate: booking.travelDate.toISOString(),
    totalAmount: booking.totalAmount,
    tourTitle: booking.Tour?.title ?? null
  }));

  return NextResponse.json({ bookings: payload });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const booking = await prisma.booking.create({
    data: {
      tourId: body.tourId || "UNKNOWN",
      userId: body.userId || "anon",
      date: new Date(body.date || Date.now()),
      passengers: Number(body.passengers) || 1,
      totalAmount: Number(body.totalAmount) || 0,
      supplierAmount: Number(body.supplierAmount) || 0,
      platformFee: Number(body.platformFee) || 0
    }
  });
  return NextResponse.json({ booking }, { status: 201 });
}
