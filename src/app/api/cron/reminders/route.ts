import { format } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = new Date(Date.now() + 23 * 60 * 60 * 1000);
  const end = new Date(Date.now() + 25 * 60 * 60 * 1000);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      tripDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
      listing: true,
    },
  });

  for (const booking of upcomingBookings) {
    if (!booking.user.email) continue;
    await sendEmail({
      to: booking.user.email,
      subject: `Reminder: ${booking.listing.title} is tomorrow`,
      html: `<p>Your booking ${booking.bookingReference} for ${booking.listing.title} is scheduled on ${format(booking.tripDate, "PPP p")}. Amount paid: ${formatCurrency(booking.totalAmount)}.</p>`,
    });
  }

  return NextResponse.json({ reminded: upcomingBookings.length });
}
