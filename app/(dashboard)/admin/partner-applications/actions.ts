import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAccountStatusNotification } from "@/lib/notificationService";
import { NotificationRole, NotificationType } from "@/lib/types/notificationTypes";

const ensureStatusMessage = (status: "APPROVED" | "REJECTED") =>
  status === "APPROVED"
    ? "Tu cuenta ha sido aprobada. Ya puedes acceder al panel según tu rol."
    : "Tu cuenta ha sido rechazada. Esta cuenta se borrará en 48 horas. Gracias por el interés.";

async function updateApplicationStatus(formData: FormData, status: "APPROVED" | "REJECTED") {
  "use server";
  const id = formData.get("applicationId");
  if (!id || typeof id !== "string") {
    throw new Error("Falta el identificador de la solicitud.");
  }

  const application = await prisma.partnerApplication.findUnique({
    where: { id },
    include: { User: true }
  });

  if (!application) {
    throw new Error("Solicitud no encontrada.");
  }

  await prisma.partnerApplication.update({
    where: { id },
    data: { status }
  });

  if (application.userId) {
    const statusMessage = ensureStatusMessage(status);

    await prisma.user.update({
      where: { id: application.userId },
      data: {
        supplierApproved: status === "APPROVED" && application.role === "SUPPLIER",
        agencyApproved: status === "APPROVED" && application.role === "AGENCY",
        accountStatus: status === "APPROVED" ? "APPROVED" : "REJECTED",
        statusMessage,
        rejectionAt: status === "REJECTED" ? new Date() : null
      }
    });

    const notificationType: NotificationType =
      application.role === "SUPPLIER" ? "SUPPLIER_ACCOUNT_STATUS" : "AGENCY_ACCOUNT_STATUS";

    await createAccountStatusNotification({
      userId: application.userId,
      role: application.role as NotificationRole,
      message: statusMessage,
      type: notificationType
    });
  }

  revalidatePath("/admin/partner-applications");
  revalidatePath("/admin/crm");
}

export async function approveApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "APPROVED");
}

export async function rejectApplication(formData: FormData) {
  "use server";
  await updateApplicationStatus(formData, "REJECTED");
}
