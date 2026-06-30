import { Star } from "lucide-react";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= Math.round(rating);
        return <Star key={index} className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />;
      })}
      <span className="ml-1 text-sm text-zinc-600">{rating.toFixed(1)}</span>
    </div>
  );
}
