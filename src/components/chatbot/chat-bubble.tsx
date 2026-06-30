export function ChatBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${role === "user" ? "ml-auto bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-900"}`}>
      {content}
    </div>
  );
}
