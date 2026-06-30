import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getBookingById } from "@/server/services/booking-service";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <div className="container-shell section-spacing">
      <div className="card-surface mx-auto max-w-3xl p-8 text-center">
        <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          Payment successful
        </span>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
          Your adventure is confirmed
        </h1>
        <p className="mt-3 text-slate-600">
          Booking reference: {booking.bookingReference}
        </p>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Listing</p>
            <p className="mt-2 font-medium text-slate-900">
              {booking.listing.title}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Trip date</p>
            <p className="mt-2 font-medium text-slate-900">
              {new Date(booking.tripDate).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 font-medium text-slate-900">{booking.status}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Amount paid</p>
            <p className="mt-2 font-medium text-slate-900">
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/user"
            className="rounded-full bg-teal-600 px-5 py-3 text-white"
          >
            View my bookings
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-slate-200 px-5 py-3 text-slate-700"
          >
            Book another trip
          </Link>
        </div>
      </div>
    </div>
  );
}
