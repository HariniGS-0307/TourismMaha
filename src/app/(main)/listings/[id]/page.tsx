import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/booking/booking-form";
import { ReviewSummary } from "@/components/listings/review-summary";
import { getListingVisuals } from "@/lib/listing-visuals";
import { formatCurrency } from "@/lib/utils";
import { getListingById } from "@/server/services/listing-service";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  const effectivePrice = listing.discountPrice ?? listing.pricePerPerson;
  const galleryImages = getListingVisuals({
    listingSlug: listing.slug,
    destinationSlug: listing.destination.slug,
    images: listing.images,
  });
  const spotsLeft = listing.availabilitySlots.reduce(
    (sum, slot) => sum + (slot.capacity - slot.bookedCount),
    0,
  );

  return (
    <div className="container-shell section-spacing grid gap-8 xl:grid-cols-[1fr_24rem]">
      <div className="space-y-8">
        <section className="card-surface overflow-hidden">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <div className="relative min-h-88">
              <Image
                src={galleryImages[0]}
                alt={listing.title}
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="grid gap-3 p-3">
              {galleryImages.slice(1, 3).map((image) => (
                <div
                  key={image}
                  className="relative min-h-42 overflow-hidden rounded-2xl"
                >
                  <Image
                    src={image}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 768px) 22vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card-surface p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  {listing.category.name}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {listing.destination.name}
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                {listing.title}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                {listing.fullDescription}
              </p>
            </div>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
              Save to wishlist
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Price</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(effectivePrice)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Rating</p>
              <p className="mt-2 text-xl font-semibold">
                {listing.avgRating.toFixed(1)} / 5
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Duration</p>
              <p className="mt-2 text-xl font-semibold">
                {listing.durationDays
                  ? `${listing.durationDays} day(s)`
                  : `${listing.durationHours} hrs`}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Spots left</p>
              <p className="mt-2 text-xl font-semibold">{spotsLeft}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="card-surface p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Day-wise itinerary
            </h2>
            <div className="mt-6 space-y-4">
              {listing.itineraryDays.map((day) => (
                <div key={day.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-teal-700">
                    Day {day.dayNumber}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {day.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div className="card-surface p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Inclusions & exclusions
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-900">Included</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {listing.inclusions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Not included</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {listing.exclusions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-surface p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                Operator info
              </h2>
              <p className="mt-3 text-lg font-medium text-slate-900">
                {listing.operator.businessName}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Verified: {listing.operator.isVerified ? "Yes" : "Pending"}
              </p>
              <p className="text-sm text-slate-600">
                Total bookings: {listing.operator.totalBookings}
              </p>
              <Link
                href={`tel:${listing.operator.phone}`}
                className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Contact operator
              </Link>
            </div>
          </div>
        </section>

        <section className="card-surface p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Reviews</h2>
          <div className="mt-6 space-y-6">
            <ReviewSummary reviews={listing.reviews} />
            {listing.reviews.length ? (
              listing.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-900">
                      {review.user.name ?? "Traveller"}
                    </p>
                    <p className="text-sm text-amber-600">{review.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {review.comment}
                  </p>
                  {review.reply ? (
                    <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                      Operator reply: {review.reply}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No reviews yet. Completed travellers can leave feedback from their dashboard.
              </p>
            )}
          </div>
        </section>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <BookingForm
          listingId={listing.id}
          pricePerPerson={effectivePrice}
          groupSizeMin={listing.groupSizeMin}
          groupSizeMax={listing.groupSizeMax}
          slots={listing.availabilitySlots}
          requireAuth={!session?.user}
        />
      </aside>
    </div>
  );
}
