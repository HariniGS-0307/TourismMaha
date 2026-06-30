import { notFound } from "next/navigation";
import { CheckoutClient } from "@/components/booking/checkout-client";
import { getBookingById } from "@/server/services/booking-service";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    notFound();
  }

  return (
    <div className="container-shell section-spacing">
      <CheckoutClient
        bookingId={booking.id}
        amount={booking.totalAmount}
        listingTitle={booking.listing.title}
        tripDate={booking.tripDate.toISOString()}
      />
    </div>
  );
}
