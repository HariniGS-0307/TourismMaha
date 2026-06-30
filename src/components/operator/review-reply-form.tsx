"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewReplyForm({
  reviewId,
  existingReply,
}: {
  reviewId: string;
  existingReply?: string | null;
}) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply ?? "");
  const [editing, setEditing] = useState(!existingReply);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReply() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, reply }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to post reply.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing && existingReply) {
    return (
      <div className="space-y-2">
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
          Operator reply: {existingReply}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
        >
          Edit reply
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <textarea
        rows={3}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        placeholder="Reply publicly to the traveller’s feedback"
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submitReply}
          disabled={loading || reply.trim().length < 5}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Saving..." : existingReply ? "Update reply" : "Post reply"}
        </button>
        {existingReply ? (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setReply(existingReply);
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
