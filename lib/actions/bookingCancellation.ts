"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requiresCancellationRequest } from "@/lib/bookings";
import { BookingStatus, BookingStatusEnum, BookingSourceEnum } from "@/lib/types/booking";
import { createNotification } from "@/lib/notificationService";

const revalidate = () => {
  revalidatePath("/admin/bookings");
  revalidatePath("/supplier/bookings");
  revalidatePath("/agency/bookings");
  revalidatePath("/dashboard/customer");
};

const formatDateLabel = (value?: Date | null) => {
  if (!value) return "fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long"
  }).format(value);
};

const buildBookingSummary = (title: string, travelDate: Date, pax: number) =>
  `${title} · ${pax} pax · ${formatDateLabel(travelDate)}`;

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "SUPPLIER":
      return "supplier";
    case "AGENCY":
      return "agencia";
    default:
      return role.toLowerCase();
  }
};

// Notificaciones: ADMIN_BOOKING_CANCELLED, SUPPLIER_BOOKING_CANCELLED, AGENCY_BOOKING_CANCELLED
const notifyCancellation = async (bookingId: string, role: string, reason?: string) => {
  const current = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Tour: {
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
      }
    }
  });
  if (!current || !current.Tour) {
    return;
  }
  const tourTitle = current.Tour.title;
  const summary = buildBookingSummary(tourTitle, current.travelDate, (current.paxAdults ?? 0) + (current.paxChildren ?? 0));
  const reasonLabel = reason ? ` • Motivo: ${reason}` : "";

  const adminMessage = `Reserva ${summary} cancelada por ${getRoleLabel(role)}${reasonLabel}.`;

  await createNotification({
    type: "ADMIN_BOOKING_CANCELLED",
    role: "ADMIN",
    title: "Reserva cancelada",
    message: adminMessage,
    bookingId,
    metadata: {
      tourId: current.Tour.id,
      reason
    }
  });

  if (current.Tour.SupplierProfile?.userId) {
    await createNotification({
      type: "SUPPLIER_BOOKING_CANCELLED",
      role: "SUPPLIER",
      title: `Reserva cancelada en ${tourTitle}`,
      message: `La reserva ${summary} fue cancelada${reason ? ` (motivo: ${reason})` : ""}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id
      },
      recipientUserId: current.Tour.SupplierProfile.userId
    });
  }

  if (current.source === BookingSourceEnum.AGENCY || role === "AGENCY") {
    await createNotification({
      type: "AGENCY_BOOKING_CANCELLED",
      role: "AGENCY",
      title: "Reserva cancelada",
      message: `Tu reserva ${summary} fue cancelada${reason ? ` (motivo: ${reason})` : ""}.`,
      bookingId,
      metadata: {
        tourId: current.Tour.id
      }
    });
  }
};

const updateCancellation = async (bookingId: string, status: BookingStatus, role: string, reason?: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }
  const payload: Record<string, any> = {
    status,
    cancellationByRole: role,
    cancellationAt: new Date()
  };
  if (reason) {
    payload.cancellationReason = reason;
  } else {
    payload.cancellationReason = booking.cancellationReason ?? null;
  }
  await prisma.booking.update({
    where: { id: bookingId },
    data: payload
  });
  if (status === BookingStatusEnum.CANCELLED) {
    await notifyCancellation(bookingId, role, reason ?? booking.cancellationReason ?? undefined);
  }
  revalidate();
};

export async function adminCancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Selecciona una reserva válida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "ADMIN", reason.trim());
}

export async function adminApproveCancellation(formData: FormData) {
  const bookingId = formData.get("bookingId");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "ADMIN");
}

export async function supplierCancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Reserva no encontrada.");
  if (requiresCancellationRequest(booking.travelDate)) {
    throw new Error("Esta reserva requiere aprobación del admin.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "SUPPLIER", reason.trim());
}

export async function supplierRequestCancellation(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Describe el motivo de tu solicitud.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLATION_REQUESTED, "SUPPLIER", reason.trim());
}

export async function agencyCancelBooking(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Escribe un motivo para cancelar.");
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Reserva no encontrada.");
  if (requiresCancellationRequest(booking.travelDate)) {
    throw new Error("Esta reserva requiere aprobación del admin.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLED, "AGENCY", reason.trim());
}

export async function agencyRequestCancellation(formData: FormData) {
  const bookingId = formData.get("bookingId");
  const reason = formData.get("reason");
  if (!bookingId || typeof bookingId !== "string") {
    throw new Error("Reserva inválida.");
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    throw new Error("Describe el motivo de tu solicitud.");
  }
  await updateCancellation(bookingId, BookingStatusEnum.CANCELLATION_REQUESTED, "AGENCY", reason.trim());
}
