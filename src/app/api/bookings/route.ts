import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBookingSchema } from "@/lib/validators/booking";
import {
  createPendingBooking,
  getUserBookings,
} from "@/server/services/booking-service";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await getUserBookings(session.user.id);
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse({
      ...body,
      numberOfPeople: Number(body.numberOfPeople),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const booking = await createPendingBooking({
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create booking.",
      },
      { status: 400 },
    );
  }
}
