type BookingFinancialsProps = {
  pricePerPerson: number;
  passengers: number;
  agencyCommissionRate?: number;
};

export function calculateBookingFinancials({
  pricePerPerson,
  passengers,
  agencyCommissionRate = 0.1
}: BookingFinancialsProps) {
  const total = pricePerPerson * passengers;
  const supplierPayout = total * 0.8;
  const platformPool = total - supplierPayout;
  const agencyFee = platformPool * agencyCommissionRate;
  const platformFee = platformPool - agencyFee;

  return {
    total,
    supplierPayout,
    agencyFee,
    platformFee
  };
}

export function computeFinance(total: number) {
  const supplier = total * 0.8;
  const platform = total - supplier;
  return {
    supplier,
    platform,
    agency: platform * 0.1,
    platformRemaining: platform * 0.9
  };
}
