import { redirect } from "next/navigation";
import { ReviewReplyForm } from "@/components/operator/review-reply-form";
import { auth } from "@/lib/auth";
import {
  getOperatorBookings,
  getOperatorReviews,
} from "@/server/services/operator-service";

export default async function OperatorBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OPERATOR") redirect("/access-denied");

  const [bookings, reviews] = await Promise.all([
    getOperatorBookings(session.user.id),
    getOperatorReviews(session.user.id),
  ]);

  return (
    <div className="container-shell section-spacing space-y-8">
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Operator inbox
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Incoming bookings
          </h1>
        </div>
        <div className="card-surface overflow-x-auto p-6">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-2">Traveller</th>
                <th className="py-2">Listing</th>
                <th className="py-2">Trip date</th>
                <th className="py-2">Payment</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-200">
                  <td className="py-3">{booking.user.name ?? booking.user.email}</td>
                  <td className="py-3">{booking.listing.title}</td>
                  <td className="py-3">
                    {new Date(booking.tripDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3">{booking.payment?.status ?? "Pending"}</td>
                  <td className="py-3">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Customer feedback
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">
            Reviews and replies
          </h2>
        </div>

        {reviews.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="card-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {review.user.name ?? review.user.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {review.listing.title} · {review.booking?.bookingReference ?? "Booking"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                    {review.rating}★
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                <p className="mt-3 text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </p>
                <div className="mt-4">
                  <ReviewReplyForm
                    reviewId={review.id}
                    existingReply={review.reply}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card-surface p-6 text-sm text-slate-500">
            No customer reviews yet.
          </div>
        )}
      </section>
    </div>
  );
}
