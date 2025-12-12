"use server";

import { BookingSourceEnum, BookingStatusEnum } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { getStripe } from "@/lib/stripe";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? fallback : numeric;
  }
  return fallback;
}

const formatDateLabel = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);

function buildBookingSummary(
  tourTitle: string,
  travelDate: Date,
  pax: number,
  startTime?: string | null
) {
  const base = `${tourTitle} Жњ ${pax} pax Жњ ${formatDateLabel(travelDate)}`;
  return startTime ? `${base} Жњ ${startTime}` : base;
}

const normalizeStringValue = (value: FormDataEntryValue | null): string | null =>
  typeof value === "string" ? value.trim() : null;

// Notificaciones: ADMIN_BOOKING_CREATED, SUPPLIER_BOOKING_CREATED
export async function createBookingAction(formData: FormData) {
  const tourId = formData.get("tourId");
  const travelDateValue = formData.get("travelDate");
  const customerName = formData.get("customerName");
  const customerEmail = formData.get("customerEmail");

  if (!tourId || typeof tourId !== "string") {
    throw new Error("Selecciona un tour válido.");
  }

  if (!travelDateValue || typeof travelDateValue !== "string") {
    throw new Error("Indica la fecha del tour.");
  }

  const travelDate = new Date(travelDateValue);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (Number.isNaN(travelDate.getTime()) || travelDate < now) {
    throw new Error("Selecciona una fecha futura.");
  }

  if (!customerName || typeof customerName !== "string") {
    throw new Error("Indica tu nombre completo.");
  }

  if (!customerEmail || typeof customerEmail !== "string") {
    throw new Error("Indica un email válido.");
  }

  const paxAdults = parseNumber(formData.get("paxAdults"), 1);
  const paxChildren = parseNumber(formData.get("paxChildren"), 0);
  if (paxAdults < 1) {
    throw new Error("Debe haber al menos un adulto.");
  }

  const customerPhone = normalizeStringValue(formData.get("customerPhone"));
  const hotel = normalizeStringValue(formData.get("hotel"));
  const pickupNotes = normalizeStringValue(formData.get("pickupNotes"));
  const selectedStartTime = normalizeStringValue(formData.get("startTime"));

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: {
              id: true
            }
          }
        }
      }
    }
  });
  if (!tour) {
    throw new Error("No pudimos encontrar ese tour.");
  }

  const passengerCount = paxAdults + paxChildren;
  const totalAmount = tour.price * passengerCount;

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | null;
  let userId = sessionUser?.id;
  if (!userId) {
    const [customer] = await Promise.all([
      prisma.user.upsert({
        where: { email: customerEmail.trim().toLowerCase() },
        create: {
          id: randomUUID(),
          email: customerEmail.trim().toLowerCase(),
          name: customerName.trim(),
          password: randomUUID()
        },
        update: {
          name: customerName.trim()
        }
      })
    ]);
    userId = customer.id;

    const secret = process.env.JWT_SECRET ?? "proactivitis-default";
    const token = jwt.sign(
      { userId: customer.id, email: customer.email },
      secret,
      { expiresIn: "7d" }
    );
    await fetch("http://localhost:3000/api/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });


  }

  const booking = await prisma.booking.create({
    data: {
      tourId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone,
      travelDate,
      paxAdults,
      paxChildren,
      hotel,
      pickupNotes,
      startTime: selectedStartTime,
      totalAmount,
      userId,
      status: BookingStatusEnum.PAYMENT_PENDING,
      source: BookingSourceEnum.WEB
    }
  });

  const summary = buildBookingSummary(tour.title, travelDate, passengerCount, selectedStartTime);

  await createNotification({
    type: "ADMIN_BOOKING_CREATED",
    role: "ADMIN",
    title: "Nueva reserva confirmada",
      message: `Reserva para ${summary}.`,
    bookingId: booking.id,
    metadata: {
      tourId: tour.id,
      pax: passengerCount
    }
  });

  if (tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_CREATED",
      role: "SUPPLIER",
      title: `Reserva nueva en ${tour.title}`,
      message: `Tienes una nueva reserva para ${summary}.`,
      bookingId: booking.id,
      metadata: {
        tourId: tour.id
      },
      recipientUserId: tour.SupplierProfile.userId
    });
  }

  const stripeClient = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const successTarget = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL ?? `${baseUrl}/booking/confirmed`;
  const cancelTarget = process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL ?? baseUrl;
  const currency = (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase();

  const buildSuccessUrl = (target: string) => {
    const url = new URL(target, baseUrl);
    const hasSearch = Boolean(url.search);
    url.searchParams.set("bookingId", booking.id);
    const prefix = `${url.toString()}${hasSearch ? "&" : "?"}`;
    return `${prefix}session_id={CHECKOUT_SESSION_ID}`.replace(/%7B/g, "{").replace(/%7D/g, "}");
  };

  const buildCancelUrl = (target: string) => {
    const url = new URL(target, baseUrl);
    url.searchParams.set("bookingId", booking.id);
    return url.toString();
  };

  const checkoutSession = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail.trim().toLowerCase(),
    line_items: [
      {
        price_data: {
          currency,
      product_data: {
        name: tour.title?.trim() || "Tour reservation",
        description: summary
      },
          unit_amount: Math.round(totalAmount * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: booking.id,
      tourId: tour.id,
      pax: passengerCount.toString(),
      startTime: selectedStartTime ?? undefined
    },
    payment_intent_data: {
      description: summary
    },
    success_url: buildSuccessUrl(successTarget),
    cancel_url: buildCancelUrl(cancelTarget)
  });

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id;

  if (!checkoutSession.url) {
    throw new Error("No se pudo iniciar el pago con Stripe. Intenta nuevamente.");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripeSessionId: checkoutSession.id,
      stripePaymentIntentId: paymentIntentId ?? null,
      paymentStatus: checkoutSession.payment_status ?? null,
      stripeCheckoutUrl: checkoutSession.url ?? null
    }
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");
  return { bookingId: booking.id, tourSlug: tour.slug, stripeSessionUrl: checkoutSession.url ?? null };
}
