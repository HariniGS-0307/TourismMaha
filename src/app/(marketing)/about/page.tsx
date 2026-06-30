import Link from "next/link";
import { CustomerFeedback } from "@/components/marketing/customer-feedback";
import { getFeaturedListings } from "@/server/services/listing-service";
import { getRecentPublicReviews } from "@/server/services/review-service";

export default async function AboutPage() {
  const [featuredListings, recentReviews] = await Promise.all([
    getFeaturedListings(),
    getRecentPublicReviews(3),
  ]);

  const feedback = recentReviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    userName: review.user.name ?? "Traveller",
    listingTitle: review.listing.title,
    listingId: review.listingId,
    destinationName: review.listing.destination.name,
  }));

  return (
    <div className="container-shell section-spacing space-y-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),linear-gradient(135deg,_#020617,_#0f766e_55%,_#0f172a)] p-8 text-white shadow-2xl md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          About Maharashtra Adventures
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold md:text-5xl">
          Built to help travellers discover, compare, and book Maharashtra’s best outdoor experiences.
        </h1>
        <p className="mt-4 max-w-3xl text-slate-200">
          We bring together verified operators, detailed itineraries, live pricing, and a smart AI concierge so planning a trek, camp, or coastal weekend feels clear and trustworthy from the first click.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-slate-200">Verified operators</p>
            <p className="mt-2 text-3xl font-semibold">Trusted</p>
            <p className="mt-2 text-sm text-slate-200">
              We focus on operator-led experiences with clear inclusions, safety details, and contactability.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-slate-200">Compare-first UX</p>
            <p className="mt-2 text-3xl font-semibold">Simple</p>
            <p className="mt-2 text-sm text-slate-200">
              Compare up to three experiences side-by-side before you commit your weekend plans.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-slate-200">AI concierge</p>
            <p className="mt-2 text-3xl font-semibold">Instant</p>
            <p className="mt-2 text-sm text-slate-200">
              Ask about availability, destinations, and your bookings using live platform data.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface p-8">
          <h2 className="text-3xl font-semibold text-slate-900">How the platform works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">01</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Discover</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Browse destinations, activity types, and featured experiences across Maharashtra.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">02</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Compare</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compare pricing, duration, operator ratings, and inclusions before choosing.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">03</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Book confidently</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Confirm your slot, pay securely, and manage everything from your dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Top-rated live experiences</h2>
          <div className="mt-6 space-y-4">
            {featuredListings.slice(0, 3).map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="block rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{listing.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {listing.destination.name} · {listing.category.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                    {listing.avgRating.toFixed(1)}★
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CustomerFeedback
        title="What travellers are saying"
        subtitle="Live feedback from recent bookings helps new customers plan with more confidence."
        reviews={feedback}
      />
    </div>
  );
}
