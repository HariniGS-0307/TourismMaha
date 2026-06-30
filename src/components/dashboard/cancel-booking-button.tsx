"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelBookingButton({
  bookingId,
  disabled = false,
  reason,
}: {
  bookingId: string;
  disabled?: boolean;
  reason?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (disabled) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to cancel booking.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading || disabled}
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {loading ? "Cancelling..." : "Cancel booking"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {!error && disabled && reason ? (
        <p className="text-xs text-slate-500">{reason}</p>
      ) : null}
    </div>
  );
}
