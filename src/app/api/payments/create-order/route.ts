import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validators/booking";
import { createPaymentOrder } from "@/server/services/payment-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const order = await createPaymentOrder(parsed.data.bookingId);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create payment order.",
      },
      { status: 400 },
    );
  }
}
