type ReviewSummaryProps = {
  reviews: Array<{
    rating: number;
  }>;
};

function getFilledSegments(count: number, total: number) {
  return total ? Math.round((count / total) * 10) : 0;
}

export function ReviewSummary({ reviews }: ReviewSummaryProps) {
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));

  if (!total) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
        No ratings yet. Once travellers complete their trip, reviews will show up here.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <div className="rounded-3xl bg-slate-50 p-5">
        <p className="text-sm text-slate-500">Average rating</p>
        <p className="mt-2 text-4xl font-semibold text-slate-900">
          {(reviews.reduce((sum, review) => sum + review.rating, 0) / total).toFixed(1)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Based on {total} review{total === 1 ? "" : "s"}
        </p>
      </div>
      <div className="space-y-3">
        {counts.map((item) => {
          const filled = getFilledSegments(item.count, total);
          return (
            <div key={item.rating} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="font-medium text-slate-700">{item.rating}★</span>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, index) => (
                  <span
                    key={`${item.rating}-${index}`}
                    className={`h-2.5 rounded-full ${index < filled ? "bg-teal-500" : "bg-slate-100"}`}
                  />
                ))}
              </div>
              <span className="text-right text-slate-500">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
