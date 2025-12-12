import { prisma } from "@/lib/prisma";
import { NotificationRole, NotificationType } from "@/lib/types/notificationTypes";
import { randomUUID } from "crypto";

export type NotificationMetadata = {
  role?: NotificationRole;
  userId?: string;
  bookingId?: string;
  referenceUrl?: string;
  [key: string]: any;
};

export type NotificationRecipient = {
  userId?: string | null;
  role?: NotificationRole | null;
  limit?: number;
};

export const parseNotificationMetadata = (value?: string | null): NotificationMetadata => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const buildRecipientFilters = ({ userId, role }: NotificationRecipient) => {
  const filters = [];
  if (userId) {
    filters.push({ metadata: { contains: `"userId":"${userId}"` } });
  }
  if (role) {
    filters.push({ role });
  }
  return filters.length ? { OR: filters } : undefined;
};

export async function createNotification({
  type,
  role,
  title,
  message,
  metadata,
  bookingId,
  recipientUserId
}: {
  type: NotificationType;
  role: NotificationRole;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  bookingId?: string;
  recipientUserId?: string | null;
}) {
  const payload: NotificationMetadata = {
    ...(metadata ?? {})
  };
  if (recipientUserId) payload.userId = recipientUserId;
  payload.role = role;
  await prisma.notification.create({
    data: {
      id: randomUUID(),
      type,
      role,
      title,
      message,
      body: message,
      bookingId: bookingId ?? metadata?.bookingId ?? null,
      metadata: Object.keys(payload).length ? JSON.stringify(payload) : null,
      caseNumber: metadata?.bookingId ?? null,
      isRead: false
    }
  });
}

export const createPartnerApplicationNotification = async ({
  applicationId,
  companyName
}: {
  applicationId: string;
  companyName: string;
}) => {
  await createNotification({
    type: "ADMIN_PARTNER_APPLICATION",
    role: "ADMIN",
    title: "Nueva solicitud",
    message: companyName,
    metadata: {
      referenceUrl: `/admin/partner-applications`,
      applicationId
    }
  });
};

export const createAccountStatusNotification = async ({
  userId,
  role,
  message,
  type
}: {
  userId: string;
  role: NotificationRole;
  message: string;
  type: NotificationType;
}) => {
  await createNotification({
    type,
    role,
    title: "Estado de cuenta",
    message,
    metadata: {
      referenceUrl: `/portal/${role.toLowerCase()}`
    },
    recipientUserId: userId
  });
};

export async function getNotificationsForRecipient(recipient: NotificationRecipient) {
  const { limit = 5 } = recipient;
  const where = buildRecipientFilters(recipient);
  if (!where) return [];
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

export async function getNotificationUnreadCount(recipient: NotificationRecipient) {
  const where = buildRecipientFilters(recipient);
  if (!where) return 0;
  return prisma.notification.count({
    where: {
      ...where,
      isRead: false
    }
  });
}

export async function getContactNotifications(limit = 50) {
  return prisma.notification.findMany({
    where: {
      role: "ADMIN",
      type: "ADMIN_CONTACT_REQUEST"
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

export async function markNotificationRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
}
