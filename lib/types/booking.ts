export const BookingStatusEnum = {
  PAYMENT_PENDING: "PAYMENT_PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED"
} as const;
export type BookingStatus = (typeof BookingStatusEnum)[keyof typeof BookingStatusEnum];

export const BookingSourceEnum = {
  WEB: "WEB",
  SUPPLIER: "SUPPLIER",
  AGENCY: "AGENCY"
} as const;
export type BookingSource = (typeof BookingSourceEnum)[keyof typeof BookingSourceEnum];

export const BookingCancellerEnum = {
  ADMIN: "ADMIN",
  SUPPLIER: "SUPPLIER",
  AGENCY: "AGENCY",
  CUSTOMER: "CUSTOMER"
} as const;
export type BookingCanceller = (typeof BookingCancellerEnum)[keyof typeof BookingCancellerEnum];
