"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { createNotification } from "@/lib/notificationService";
import { NotificationType } from "@/lib/types/notificationTypes";
import { TOUR_DELETE_REASONS } from "@/lib/constants/tourDeletion";

const notifySupplier = async (
  tourId: string,
  title: string,
  body: string,
  type: NotificationType,
  metadata?: Record<string, string>
) => {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { SupplierProfile: { include: { User: true } } }
  });
  if (!tour?.SupplierProfile?.User?.id) return;
  await createNotification({
    type,
    role: "SUPPLIER",
    title,
    message: body,
    metadata: metadata ? { tourId, ...metadata } : { tourId },
    recipientUserId: tour.SupplierProfile.User.id
  });
};

const changeTourStatus = async (tourId: string, status: string, note?: string) => {
  await prisma.tour.update({
    where: { id: tourId },
    data: {
      status,
      adminNote: note
    }
  });
  revalidatePath("/admin/tours");
  revalidatePath("/supplier/tours");
  revalidatePath("/dashboard/customer");
};

const deleteReasonLookup = Object.fromEntries(
  TOUR_DELETE_REASONS.map((reason) => [reason.value, reason.label])
);

export async function approveTour(formData: FormData) {
  const tourId = formData.get("tourId");
  const note = formData.get("note");
  if (!tourId || typeof tourId !== "string") return;
  await changeTourStatus(tourId, "published", typeof note === "string" ? note : undefined);
  await notifySupplier(
    tourId,
    "Tour aprobado",
    "Tu tour fue aprobado y ya está publicado para clientes.",
    "SUPPLIER_ACCOUNT_STATUS"
  );
}

export async function requestChanges(formData: FormData) {
  const tourId = formData.get("tourId");
  const note = formData.get("note");
  if (!tourId || typeof tourId !== "string") return;
  await changeTourStatus(tourId, "needs_changes", typeof note === "string" ? note : undefined);
  await notifySupplier(
    tourId,
    "Cambios requeridos",
    "El admin solicitó correcciones antes de publicar.",
    "SUPPLIER_ACCOUNT_STATUS"
  );
}

export async function sendToReview(formData: FormData) {
  const tourId = formData.get("tourId");
  if (!tourId || typeof tourId !== "string") return;
  await changeTourStatus(tourId, "under_review");
  await notifySupplier(
    tourId,
    "Tour en revisión",
    "Tu tour fue enviado a revisión. El equipo de Proactivitis lo revisará pronto.",
    "SUPPLIER_ACCOUNT_STATUS"
  );
}

export async function togglePauseTour(formData: FormData) {
  const tourId = formData.get("tourId");
  const currentStatus = formData.get("currentStatus");
  if (!tourId || typeof tourId !== "string") return;
  const status = currentStatus === "paused" ? "published" : "paused";
  await changeTourStatus(tourId, status);
}

export async function deleteTourAction(formData: FormData) {
  const tourId = formData.get("tourId");
  const reasonValue = formData.get("reason");
  if (!tourId || typeof tourId !== "string") return;
  const reasonLabel =
    typeof reasonValue === "string" ? deleteReasonLookup[reasonValue] : undefined;
  const note = reasonLabel ?? "Motivo no especificado";
  await notifySupplier(
    tourId,
    "Tour eliminado",
    `Tu tour ha sido eliminado por: ${note}`,
    "SUPPLIER_TOUR_REMOVED",
    { reason: note }
  );
  await prisma.tour.delete({ where: { id: tourId } });
  revalidatePath("/admin/tours");
  revalidatePath("/supplier/tours");
  revalidatePath("/dashboard/customer");
}
