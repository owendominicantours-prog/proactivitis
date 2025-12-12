"use server";

import { markNotificationRead } from "@/lib/notificationService";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId");
  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Selecciona una notificación válida.");
  }

  await markNotificationRead(notificationId);

  const redirectTo = formData.get("redirectTo");
  if (redirectTo && typeof redirectTo === "string" && redirectTo.trim()) {
    redirect(redirectTo);
  }

  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (notif) {
    const meta = notif.metadata ? JSON.parse(notif.metadata) : {};
    const bookingId = meta.bookingId || notif.bookingId;
    const role = (meta.role || notif.role || "").toString().toUpperCase();
    if (bookingId) {
      if (role.includes("ADMIN")) redirect(`/admin/bookings?bookingId=${bookingId}`);
      if (role.includes("SUPPLIER")) redirect(`/supplier/bookings?bookingId=${bookingId}`);
      if (role.includes("AGENCY")) redirect(`/agency/bookings?bookingId=${bookingId}`);
      if (role.includes("CUSTOMER")) redirect(`/booking/confirmed?bookingId=${bookingId}`);
    }
  }

  redirect("/");
}
