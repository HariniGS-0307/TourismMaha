import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/booking/booking-form";
import { getListingById } from "@/server/services/listing-service";
import { notFound } from "next/navigation";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await auth();
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  const price = listing.discountPrice ?? listing.pricePerPerson;

  return (
    <div className="container-shell section-spacing grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="card-surface p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Book {listing.title}
        </h1>
        <p className="mt-3 text-slate-600">
          Choose your preferred date, group size, and any special requests before
          proceeding to secure checkout.
        </p>
        {!session?.user ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please sign in before confirming your booking.
          </p>
        ) : null}
      </div>
      <BookingForm
        listingId={listing.id}
        pricePerPerson={price}
        groupSizeMin={listing.groupSizeMin}
        groupSizeMax={listing.groupSizeMax}
        slots={listing.availabilitySlots}
        requireAuth={!session?.user}
      />
    </div>
  );
}
