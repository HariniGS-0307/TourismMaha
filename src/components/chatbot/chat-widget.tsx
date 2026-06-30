"use client";

import { MessageCircle, SendHorizonal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ChatCard = {
  type: "listing" | "booking";
  title: string;
  subtitle: string;
  href: string;
  badges: string[];
};

type ChatItem = {
  role: "user" | "assistant";
  content: string;
  cards?: ChatCard[];
};

const quickReplies = [
  "Best treks this weekend",
  "Compare camping options near Lonavala",
  "Track my booking",
];

function getSessionId() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem("maha-chat-session");
  if (existing) {
    return existing;
  }

  const value = crypto.randomUUID();
  window.localStorage.setItem("maha-chat-session", value);
  return value;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you find treks, compare activities, check availability, or track your bookings.",
    },
  ]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;

    const nextHistory = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content: trimmed },
    ];
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          message: trimmed,
          history: nextHistory,
        }),
      });

      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.message ?? data.error ?? "I couldn't answer that right now.",
          cards: Array.isArray(data.cards) ? data.cards : [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I couldn't reach the concierge right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 md:bottom-4 md:right-4">
      {open ? (
        <div className="flex h-[78vh] w-[min(100vw-1.5rem,26rem)] flex-col overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 shadow-[0_30px_100px_-35px_rgba(15,23,42,0.55)] backdrop-blur md:h-[42rem] md:w-[26rem]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),linear-gradient(135deg,_#020617,_#0f766e_55%,_#0f172a)] px-4 py-4 text-white">
            <div>
              <p className="font-semibold">AI Adventure Concierge</p>
              <p className="text-xs text-slate-200">
                Ask about listings, availability, and bookings.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-200"
                onClick={() => sendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-4">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={item.role === "user" ? "space-y-2" : "space-y-3"}>
                <div
                  className={
                    item.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl bg-teal-600 px-4 py-3 text-sm whitespace-pre-wrap text-white"
                      : "max-w-[92%] rounded-2xl bg-white px-4 py-3 text-sm whitespace-pre-wrap text-slate-800 shadow-sm"
                  }
                >
                  {item.content}
                </div>
                {item.role === "assistant" && item.cards?.length ? (
                  <div className="space-y-2">
                    {item.cards.map((card) => (
                      <Link
                        key={`${card.type}-${card.href}-${card.title}`}
                        href={card.href}
                        className="block max-w-[92%] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{card.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
                          </div>
                          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                            {card.type === "booking" ? "Booking" : "Listing"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {card.badges.map((badge) => (
                            <span
                              key={badge}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="max-w-[92%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Thinking…
              </div>
            ) : null}
          </div>

          <form
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about destinations, prices, or bookings"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-2xl bg-teal-600 p-3 text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-500/30 transition hover:-translate-y-0.5 hover:bg-teal-500"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
