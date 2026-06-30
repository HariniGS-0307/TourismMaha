import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyPaymentSchema } from "@/lib/validators/booking";
import { verifyAndCapturePayment } from "@/server/services/payment-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await verifyAndCapturePayment(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 400 },
    );
  }
}
