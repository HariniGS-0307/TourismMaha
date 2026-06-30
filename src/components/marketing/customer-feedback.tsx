import Link from "next/link";

type FeedbackItem = {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  listingTitle: string;
  listingId: string;
  destinationName: string;
};

export function CustomerFeedback({
  title,
  subtitle,
  reviews,
}: {
  title: string;
  subtitle: string;
  reviews: FeedbackItem[];
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Customer feedback
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="card-surface flex h-full flex-col justify-between p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{review.userName}</p>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  {review.rating}★
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">“{review.comment}”</p>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
              <p className="font-medium text-slate-900">{review.listingTitle}</p>
              <p className="mt-1 text-slate-500">{review.destinationName}</p>
              <Link
                href={`/listings/${review.listingId}`}
                className="mt-3 inline-flex text-sm font-medium text-teal-700"
              >
                View experience
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
