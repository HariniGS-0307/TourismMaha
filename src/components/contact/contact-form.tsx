"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("booking-help");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, topic, message }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to send your message.");
      return;
    }

    setStatus(data.message ?? "Your message has been sent.");
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Send us a message</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use this form for booking help, operator onboarding, or general support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            placeholder="Your name"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Topic</span>
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        >
          <option value="booking-help">Booking help</option>
          <option value="operator-verification">Operator verification</option>
          <option value="group-trip-planning">Group trip planning</option>
          <option value="payment-support">Payment support</option>
          <option value="general-enquiry">General enquiry</option>
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        <span>Message</span>
        <textarea
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          placeholder="Tell us how we can help. Include booking reference or destination if relevant."
        />
      </label>

      {status ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-teal-600 px-5 py-3 font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
