import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getAdminOverview() {
  const users = await prisma.user.count();
  const operators = await prisma.operatorProfile.count();
  const listings = await prisma.listing.count();
  const bookings = await prisma.booking.findMany();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const gmv = bookings
    .filter(
      (booking) =>
        booking.status !== "CANCELLED" &&
        new Date(booking.createdAt).getMonth() === currentMonth &&
        new Date(booking.createdAt).getFullYear() === currentYear,
    )
    .reduce((sum, booking) => sum + booking.totalAmount, 0);

  const chart = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(new Date(), 29 - index);
    const count = bookings.filter(
      (booking) =>
        new Date(booking.createdAt).toDateString() === date.toDateString(),
    ).length;
    return {
      day: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      bookings: count,
    };
  });

  return {
    stats: {
      totalUsers: users,
      totalOperators: operators,
      totalListings: listings,
      totalBookings: bookings.length,
      gmvThisMonth: gmv,
    },
    chart,
  };
}

export async function getAdminOperators() {
  return prisma.operatorProfile.findMany({
    include: { user: true, listings: true },
    orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
  });
}

export async function getAdminListings() {
  return prisma.listing.findMany({
    include: {
      destination: true,
      category: true,
      operator: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUsers(query?: string) {
  return prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminBookings() {
  return prisma.booking.findMany({
    include: {
      user: true,
      listing: { include: { destination: true, operator: true } },
      payment: true,
      slot: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
