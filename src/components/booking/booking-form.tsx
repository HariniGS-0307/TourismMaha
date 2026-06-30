"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type BookingFormProps = {
  listingId: string;
  pricePerPerson: number;
  groupSizeMin: number;
  groupSizeMax: number;
  slots: Array<{
    id: string;
    date: string | Date;
    startTime: string;
    capacity: number;
    bookedCount: number;
  }>;
  requireAuth?: boolean;
};

export function BookingForm({
  listingId,
  pricePerPerson,
  groupSizeMin,
  groupSizeMax,
  slots,
  requireAuth = false,
}: BookingFormProps) {
  const [slotId, setSlotId] = useState(slots[0]?.id ?? "");
  const [numberOfPeople, setNumberOfPeople] = useState(groupSizeMin);
  const [couponCode, setCouponCode] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => numberOfPeople * pricePerPerson,
    [numberOfPeople, pricePerPerson],
  );

  const hasSlots = slots.length > 0;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        slotId,
        numberOfPeople,
        couponCode,
        specialRequests,
      }),
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to continue with booking.");
      return;
    }

    window.location.href = `/booking/checkout?bookingId=${data.id}`;
  }

  return (
    <div className="card-surface space-y-4 p-5">
      <div>
        <p className="text-sm text-slate-500">Starting from</p>
        <p className="text-3xl font-semibold text-slate-900">
          {formatCurrency(pricePerPerson)}
        </p>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Select date
        </label>
        <select
          value={slotId}
          onChange={(event) => setSlotId(event.target.value)}
          disabled={!hasSlots}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 disabled:bg-slate-50 disabled:text-slate-400"
        >
          {hasSlots ? (
            slots.map((slot) => {
              const openSpots = slot.capacity - slot.bookedCount;
              return (
                <option key={slot.id} value={slot.id} disabled={openSpots <= 0}>
                  {new Date(slot.date).toLocaleDateString("en-IN")} · {" "}
                  {slot.startTime} · {openSpots} spots left
                </option>
              );
            })
          ) : (
            <option value="">No upcoming dates available</option>
          )}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          People
        </label>
        <input
          type="number"
          min={groupSizeMin}
          max={groupSizeMax}
          value={numberOfPeople}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            setNumberOfPeople(
              Math.min(groupSizeMax, Math.max(groupSizeMin, nextValue || groupSizeMin)),
            );
          }}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Coupon code
        </label>
        <input
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Special requests
        </label>
        <textarea
          value={specialRequests}
          onChange={(event) => setSpecialRequests(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Estimated total</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!hasSlots ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This listing has no active upcoming slots right now.
        </p>
      ) : null}
      {requireAuth ? (
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/booking/${listingId}`)}`}
          className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-medium text-white"
        >
          Login to continue booking
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !slotId || !hasSlots}
          className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Creating booking..." : "Continue to checkout"}
        </button>
      )}
    </div>
  );
}
