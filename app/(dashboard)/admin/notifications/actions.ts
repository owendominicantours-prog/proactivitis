"use server";

import { revalidatePath } from "next/cache";
import { markNotificationRead } from "@/lib/notificationService";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId");
  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Selecciona una notificación válida.");
  }
  await markNotificationRead(notificationId);
  revalidatePath("/admin");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/crm");
}
