import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getOperatorProfileByUserId(userId: string) {
  return prisma.operatorProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function getOperatorDashboard(userId: string) {
  const operator = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!operator) {
    throw new Error("Operator profile not found.");
  }

  const listings = await prisma.listing.findMany({
    where: { operatorId: operator.id },
    include: {
      bookings: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const recentBookings = await prisma.booking.findMany({
    where: {
      listing: {
        operatorId: operator.id,
      },
    },
    include: {
      user: true,
      listing: true,
      slot: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyBookings = recentBookings.filter(
    (booking) =>
      new Date(booking.createdAt).getMonth() === currentMonth &&
      new Date(booking.createdAt).getFullYear() === currentYear,
  );

  const revenue = recentBookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((sum, booking) => sum + booking.totalAmount, 0);

  const ratings = listings.flatMap((listing) =>
    listing.reviews.map((review) => review.rating),
  );
  const averageRating = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : 0;

  const analytics = Array.from({ length: 6 }, (_, index) => {
    const day = subDays(new Date(), 5 - index);
    const dayLabel = day.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const dayRevenue = recentBookings
      .filter(
        (booking) =>
          new Date(booking.createdAt).toDateString() === day.toDateString(),
      )
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      day: dayLabel,
      revenue: dayRevenue,
    };
  });

  return {
    operator,
    stats: {
      totalListings: listings.length,
      totalBookingsThisMonth: monthlyBookings.length,
      totalRevenue: revenue,
      averageRating,
    },
    listings,
    recentBookings,
    analytics,
  };
}

export async function getOperatorListings(userId: string) {
  const operator = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!operator) {
    throw new Error("Operator not found.");
  }

  return prisma.listing.findMany({
    where: { operatorId: operator.id },
    include: {
      category: true,
      destination: true,
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOperatorBookings(userId: string) {
  const operator = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!operator) {
    throw new Error("Operator not found.");
  }

  return prisma.booking.findMany({
    where: {
      listing: { operatorId: operator.id },
    },
    include: {
      listing: true,
      user: true,
      slot: true,
      payment: true,
    },
    orderBy: { tripDate: "asc" },
  });
}

export async function getOperatorReviews(userId: string) {
  const operator = await prisma.operatorProfile.findUnique({
    where: { userId },
  });

  if (!operator) {
    throw new Error("Operator not found.");
  }

  return prisma.review.findMany({
    where: {
      listing: {
        operatorId: operator.id,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
      booking: {
        select: {
          bookingReference: true,
          tripDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOperatorAnalytics(userId: string) {
  const dashboard = await getOperatorDashboard(userId);

  const topListings = dashboard.listings
    .map((listing) => ({
      id: listing.id,
      title: listing.title,
      bookings: listing.bookings.length,
      rating: listing.avgRating,
      revenue: listing.bookings.reduce(
        (sum, booking) => sum + booking.totalAmount,
        0,
      ),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    chart: dashboard.analytics,
    topListings,
  };
}
