export function requiresCancellationRequest(travelDate: Date) {
  const now = new Date();
  const diffMs = travelDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 48;
}

export function formatTimeUntil(travelDate: Date) {
  const now = new Date();
  const diffMs = travelDate.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `${days} día${days === 1 ? "" : "s"} restantes`;
  }
  return `${diffHours} hora${diffHours === 1 ? "" : "s"} restantes`;
}
