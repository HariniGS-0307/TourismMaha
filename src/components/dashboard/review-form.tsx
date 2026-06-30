"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({
  bookingId,
  listingId,
  listingTitle,
}: {
  bookingId: string;
  listingId: string;
  listingTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview() {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        listingId,
        rating,
        comment,
        images: [],
      }),
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to submit review.");
      return;
    }

    setOpen(false);
    setComment("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-slate-900 px-4 py-2 text-white"
      >
        Leave a review
      </button>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 md:max-w-md">
      <p className="font-semibold text-slate-900">Review {listingTitle}</p>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`rounded-full px-3 py-1 text-sm ${value <= rating ? "bg-amber-400 text-slate-900" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            {value}★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        placeholder="Share what stood out, what the operator did well, and any tips for future travellers."
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submitReview}
          disabled={submitting || comment.trim().length < 10}
          className="rounded-full bg-teal-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Submitting..." : "Submit review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-slate-200 px-4 py-2 text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
