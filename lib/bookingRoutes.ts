export type BookingRouteOptions = {
  bookingId?: string | null;
  metadataRole?: string | null;
  fallback?: string;
};

export function buildBookingDetailRoute({ bookingId, metadataRole, fallback = "/" }: BookingRouteOptions) {
  const normalizedId = bookingId?.trim();
  if (!normalizedId) {
    return fallback;
  }

  const roleHint = (metadataRole ?? "").toString().toUpperCase();
  if (roleHint.includes("ADMIN")) return `/admin/bookings?bookingId=${normalizedId}`;
  if (roleHint.includes("SUPPLIER")) return `/supplier/bookings?bookingId=${normalizedId}`;
  if (roleHint.includes("AGENCY")) return `/agency/bookings?bookingId=${normalizedId}`;
  if (roleHint.includes("CUSTOMER")) return `/booking/confirmed?bookingId=${normalizedId}`;

  return `/booking/confirmed?bookingId=${normalizedId}`;
}
