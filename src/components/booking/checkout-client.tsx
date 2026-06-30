"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutClient({
  bookingId,
  amount,
  listingTitle,
  tripDate,
}: {
  bookingId: string;
  amount: number;
  listingTitle: string;
  tripDate: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    const orderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      setLoading(false);
      setError(orderData.error ?? "Unable to start payment.");
      return;
    }

    if (orderData.isMock) {
      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `mock_pay_${bookingId}`,
          razorpaySignature: "mock_signature",
        }),
      });

      const verifyData = await verifyResponse.json();
      setLoading(false);
      if (!verifyResponse.ok) {
        setError(verifyData.error ?? "Payment verification failed.");
        return;
      }

      window.location.href = `/booking/confirmation/${bookingId}`;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (!window.Razorpay) {
        setLoading(false);
        setError("Razorpay checkout failed to load.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Maharashtra Adventures",
        description: listingTitle,
        order_id: orderData.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          setLoading(false);
          if (!verifyResponse.ok) {
            setError(verifyData.error ?? "Payment verification failed.");
            return;
          }

          window.location.href = `/booking/confirmation/${bookingId}`;
        },
        theme: {
          color: "#0f766e",
        },
      });

      razorpay.open();
    };
    document.body.appendChild(script);
  }

  return (
    <div className="card-surface max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
      <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Experience</span>
          <span>{listingTitle}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Trip date</span>
          <span>{new Date(tripDate).toLocaleDateString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 rounded-2xl bg-teal-600 px-5 py-3 font-medium text-white"
      >
        {loading ? "Processing..." : "Pay securely with Razorpay"}
      </button>
    </div>
  );
}
