import Link from "next/link";
import { differenceInHours } from "date-fns";
import { redirect } from "next/navigation";
import { CancelBookingButton } from "@/components/dashboard/cancel-booking-button";
import { ReviewForm } from "@/components/dashboard/review-form";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getUserBookings } from "@/server/services/booking-service";

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const bookings = await getUserBookings(session.user.id);

  return (
    <div className="container-shell section-spacing space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f766e_55%,_#0f172a)] p-8 text-white shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          Dashboard
        </p>
        <h1 className="mt-2 text-4xl font-semibold">My bookings</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Track upcoming trips, cancel eligible bookings, revisit past experiences, and leave feedback after you travel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/search" className="rounded-full bg-white px-4 py-2 font-medium text-slate-900">
            Book another trip
          </Link>
          <Link href="/compare" className="rounded-full border border-white/20 px-4 py-2 text-white">
            Compare experiences
          </Link>
          <Link href="/contact" className="rounded-full border border-white/20 px-4 py-2 text-white">
            Get support
          </Link>
        </div>
      </section>

      {(["upcoming", "past", "cancelled"] as const).map((group) => (
        <section key={group} className="space-y-4">
          <h2 className="text-2xl font-semibold capitalize text-slate-900">
            {group}
          </h2>
          <div className="space-y-4">
            {bookings[group].length ? (
              bookings[group].map((booking) => {
                const isCancelableStatus =
                  booking.status === "CONFIRMED" || booking.status === "PENDING";
                const isWithinWindow =
                  differenceInHours(booking.tripDate, new Date()) >= 48;
                const showCancelAction = group === "upcoming" && isCancelableStatus;

                return (
                  <div
                    key={booking.id}
                    className="card-surface flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between"
                  >
                    <div>
                      <p className="text-sm text-slate-500">
                        {booking.bookingReference}
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {booking.listing.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {booking.listing.destination.name} ·{" "}
                        {new Date(booking.tripDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex max-w-xl flex-wrap items-start gap-3 text-sm md:justify-end">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {booking.status}
                      </span>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <Link
                        href={`/booking/confirmation/${booking.id}`}
                        className="rounded-full border border-slate-200 px-4 py-2"
                      >
                        View details
                      </Link>
                      {showCancelAction ? (
                        <CancelBookingButton
                          bookingId={booking.id}
                          disabled={!isWithinWindow}
                          reason={
                            isWithinWindow
                              ? undefined
                              : "Cancellation becomes unavailable within 48 hours of the trip."
                          }
                        />
                      ) : null}
                      {booking.status === "COMPLETED" && !booking.review ? (
                        <ReviewForm
                          bookingId={booking.id}
                          listingId={booking.listingId}
                          listingTitle={booking.listing.title}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card-surface p-5 text-sm text-slate-500">
                No {group} bookings yet.
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
