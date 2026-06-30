import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelBooking } from "@/server/services/booking-service";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  try {
    if (body.action === "cancel") {
      const booking = await cancelBooking(session.user.id, id);
      return NextResponse.json(booking);
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update booking.",
      },
      { status: 400 },
    );
  }
}
