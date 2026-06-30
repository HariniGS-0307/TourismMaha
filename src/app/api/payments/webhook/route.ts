import { NextResponse } from "next/server";
import { processWebhook } from "@/server/services/payment-service";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const result = await processWebhook(payload, signature);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed." },
      { status: 400 },
    );
  }
}
