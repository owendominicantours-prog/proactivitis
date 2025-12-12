import { BookingStatus } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";

export function getCurrentMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

const confirmedStatuses: BookingStatus[] = ["CONFIRMED", "COMPLETED"];

export async function getAdminDashboardMetrics() {
  const now = new Date();
  const { start, end } = getCurrentMonthRange(now);

  const [confirmedCount, cancellationCount, requestCount, revenueResult] = await Promise.all([
    prisma.booking.count({
      where: {
        travelDate: { gte: start, lt: end },
        status: { in: confirmedStatuses }
      }
    }),
    prisma.booking.count({
      where: {
        status: "CANCELLED",
        cancellationAt: { gte: start, lt: end }
      }
    }),
    prisma.booking.count({
      where: {
        status: "CANCELLATION_REQUESTED"
      }
    }),
    prisma.booking.aggregate({
      where: {
        travelDate: { gte: start, lt: end },
        status: { in: confirmedStatuses }
      },
      _sum: { totalAmount: true }
    })
  ]);

  return {
    confirmedThisMonth: confirmedCount,
    cancellationsThisMonth: cancellationCount,
    cancellationRequests: requestCount,
    grossRevenue: revenueResult._sum.totalAmount ?? 0
  };
}

export async function getSupplierDashboardMetrics(userId: string) {
  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { Tour: { select: { id: true } } }
  });
  if (!supplier) return null;
  const tourIds = (supplier.Tour ?? []).map((tour) => tour.id);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const { start, end } = getCurrentMonthRange(now);

  const baseFilter = { tourId: { in: tourIds } };

  const [upcomingCount, paxTodaySum, cancellationsThisMonth, requestCount] = await Promise.all([
    prisma.booking.count({
      where: {
        ...baseFilter,
        travelDate: { gte: startOfToday },
        status: { in: ["CONFIRMED", "CANCELLATION_REQUESTED"] }
      }
    }),
    prisma.booking.aggregate({
      where: {
        ...baseFilter,
        travelDate: { gte: startOfToday, lt: startOfTomorrow },
        status: { not: "CANCELLED" }
      },
      _sum: {
        paxAdults: true,
        paxChildren: true
      }
    }),
    prisma.booking.count({
      where: {
        ...baseFilter,
        status: "CANCELLED",
        cancellationAt: { gte: start, lt: end }
      }
    }),
    prisma.booking.count({
      where: {
        ...baseFilter,
        status: "CANCELLATION_REQUESTED",
        cancellationByRole: "SUPPLIER"
      }
    })
  ]);

  return {
    upcomingBookings: upcomingCount,
    paxToday: (paxTodaySum._sum.paxAdults ?? 0) + (paxTodaySum._sum.paxChildren ?? 0),
    cancellationsThisMonth,
    cancellationRequests: requestCount
  };
}

export async function getAgencyDashboardMetrics(userId: string) {
  const now = new Date();
  const { start, end } = getCurrentMonthRange(now);

  const [activeBookings, cancellations, commissionResult, requestCount] = await Promise.all([
    prisma.booking.count({
      where: {
        source: "AGENCY",
        travelDate: { gte: start, lt: end },
        status: { in: confirmedStatuses }
      }
    }),
    prisma.booking.count({
      where: {
        source: "AGENCY",
        status: "CANCELLED",
        cancellationAt: { gte: start, lt: end }
      }
    }),
    prisma.booking.aggregate({
      where: {
        source: "AGENCY",
        travelDate: { gte: start, lt: end },
        status: { in: confirmedStatuses }
      },
      _sum: { totalAmount: true }
    }),
    prisma.booking.count({
      where: {
        source: "AGENCY",
        status: "CANCELLATION_REQUESTED",
        cancellationByRole: "AGENCY"
      }
    })
  ]);

  return {
    activeBookings,
    cancellationsThisMonth: cancellations,
    estimatedCommission: (commissionResult._sum.totalAmount ?? 0) * 0.2,
    cancellationRequests: requestCount
  };
}
