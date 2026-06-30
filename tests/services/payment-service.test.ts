import { describe, expect, it, vi } from "vitest";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import crypto from "crypto";

describe("razorpay signature verification", () => {
  it("validates a correct signature", () => {
    vi.stubEnv("RAZORPAY_KEY_SECRET", "test_secret");

    const orderId = "order_123";
    const paymentId = "pay_123";
    const signature = crypto.createHmac("sha256", "test_secret").update(`${orderId}|${paymentId}`).digest("hex");

    expect(verifyRazorpaySignature({ orderId, paymentId, signature })).toBe(true);
  });
});
