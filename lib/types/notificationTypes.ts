export type NotificationType =
  | "ADMIN_BOOKING_CREATED"
  | "ADMIN_BOOKING_CANCELLED"
  | "ADMIN_BOOKING_MODIFIED"
  | "ADMIN_SUPPLIER_PAYOUT_SENT"
  | "ADMIN_PAYMENT_FAILED"
  | "ADMIN_SUPPLIER_LOW_AVAILABILITY"
  | "ADMIN_SYSTEM_ALERT"
  | "ADMIN_CONTACT_REQUEST"
  | "ADMIN_PARTNER_APPLICATION"
  | "SUPPLIER_BOOKING_CREATED"
  | "SUPPLIER_BOOKING_CANCELLED"
  | "SUPPLIER_BOOKING_MODIFIED"
  | "SUPPLIER_PAYOUT_CONFIRMED"
  | "SUPPLIER_TOUR_REMINDER"
  | "SUPPLIER_ACCOUNT_STATUS"
  | "SUPPLIER_TOUR_REMOVED"
  | "AGENCY_BOOKING_CREATED"
  | "AGENCY_BOOKING_CANCELLED"
  | "AGENCY_BOOKING_MODIFIED"
  | "AGENCY_COMMISSION_PAID"
  | "AGENCY_PROMO_ALERT"
  | "AGENCY_ACCOUNT_STATUS";

export type NotificationRole = "ADMIN" | "SUPPLIER" | "AGENCY" | "CUSTOMER";

type NotificationDisplayTone = "primary" | "success" | "warning" | "danger" | "info";

export type NotificationDisplayConfig = {
  icon: string;
  label: string;
  badgeClass: string;
  textClass: string;
};

const toneStyles: Record<NotificationDisplayTone, NotificationDisplayConfig> = {
  primary: {
    icon: "?",
    label: "Notificaci?n",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-600",
    textClass: "text-sky-600"
  },
  success: {
    icon: "?",
    label: "?xito",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    textClass: "text-emerald-600"
  },
  warning: {
    icon: "?",
    label: "Alerta",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    textClass: "text-amber-600"
  },
  danger: {
    icon: "?",
    label: "Cr?tico",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    textClass: "text-rose-600"
  },
  info: {
    icon: "?",
    label: "Info",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-600",
    textClass: "text-slate-600"
  }
};

type NotificationToneConfig = {
  label: string;
  icon: string;
  badgeClass: string;
  textClass: string;
};

const createConfig = (label: string, icon: string, tone: NotificationDisplayTone): NotificationDisplayConfig => ({
  icon,
  label,
  badgeClass: toneStyles[tone].badgeClass,
  textClass: toneStyles[tone].textClass
});

const defaultDisplay: NotificationDisplayConfig = {
  icon: toneStyles.primary.icon,
  label: toneStyles.primary.label,
  badgeClass: toneStyles.primary.badgeClass,
  textClass: toneStyles.primary.textClass
};

export const notificationTypeConfig: Record<NotificationType, NotificationDisplayConfig> = {
  ADMIN_BOOKING_CREATED: createConfig("Reserva nueva", "?", "primary"),
  ADMIN_BOOKING_CANCELLED: createConfig("Reserva cancelada", "?", "danger"),
  ADMIN_BOOKING_MODIFIED: createConfig("Reserva modificada", "?", "info"),
  ADMIN_SUPPLIER_PAYOUT_SENT: createConfig("Pago al proveedor", "??", "success"),
  ADMIN_PAYMENT_FAILED: createConfig("Pago fallido", "?", "warning"),
  ADMIN_SUPPLIER_LOW_AVAILABILITY: createConfig("Baja disponibilidad", "?", "warning"),
  ADMIN_SYSTEM_ALERT: createConfig("Alerta del sistema", "?", "warning"),
  ADMIN_CONTACT_REQUEST: createConfig("Solicitud de contacto", "?", "info"),
  ADMIN_PARTNER_APPLICATION: createConfig("Nueva solicitud", "?", "primary"),
  SUPPLIER_BOOKING_CREATED: createConfig("Nueva reserva", "?", "primary"),
  SUPPLIER_BOOKING_CANCELLED: createConfig("Reserva cancelada", "?", "danger"),
  SUPPLIER_BOOKING_MODIFIED: createConfig("Reserva actualizada", "?", "info"),
  SUPPLIER_PAYOUT_CONFIRMED: createConfig("Payout confirmado", "??", "success"),
  SUPPLIER_TOUR_REMINDER: createConfig("Recordatorio de tour", "??", "info"),
  SUPPLIER_ACCOUNT_STATUS: createConfig("Estado de cuenta", "?", "info"),
  SUPPLIER_TOUR_REMOVED: createConfig("Tour eliminado", "?", "danger"),
  AGENCY_BOOKING_CREATED: createConfig("Reserva creada", "?", "primary"),
  AGENCY_BOOKING_CANCELLED: createConfig("Reserva cancelada", "?", "danger"),
  AGENCY_BOOKING_MODIFIED: createConfig("Reserva modificada", "?", "info"),
  AGENCY_COMMISSION_PAID: createConfig("Comisi?n pagada", "??", "success"),
  AGENCY_PROMO_ALERT: createConfig("Promo activa", "??", "info"),
  AGENCY_ACCOUNT_STATUS: createConfig("Estado de cuenta", "?", "info")
};

export function getNotificationDisplayProps(type?: NotificationType): NotificationDisplayConfig {
  if (!type) return defaultDisplay;
  return notificationTypeConfig[type] ?? defaultDisplay;
}
