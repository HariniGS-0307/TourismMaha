import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { CustomerFeedback } from "@/components/marketing/customer-feedback";
import { getRecentPublicReviews } from "@/server/services/review-service";

export default async function ContactPage() {
  const recentReviews = await getRecentPublicReviews(3);
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
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="card-surface p-8 md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
              Contact Maharashtra Adventures
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Need help with bookings, operators, or planning the right trip?
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600">
              Reach support for itinerary help, payment questions, group bookings, operator approvals, and last-minute availability guidance.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <Link href="mailto:support@maharashtra-adventures.com" className="mt-2 block font-medium text-slate-900">
                  support@maharashtra-adventures.com
                </Link>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone support</p>
                <Link href="tel:+919876543210" className="mt-2 block font-medium text-slate-900">
                  +91 98765 43210
                </Link>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Support hours</p>
                <p className="mt-2 font-medium text-slate-900">Daily · 8:00 AM to 9:00 PM IST</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Emergency trip support</p>
                <p className="mt-2 font-medium text-slate-900">Fast operator coordination for confirmed bookings</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="mailto:support@maharashtra-adventures.com?subject=Booking%20Help" className="rounded-full bg-teal-600 px-5 py-3 font-medium text-white">
                Email support
              </Link>
              <Link href="/search" className="rounded-full border border-slate-200 px-5 py-3 font-medium text-slate-700">
                Browse experiences
              </Link>
            </div>
          </div>

          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="card-surface p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Quick help topics</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Booking and payment help",
                  description: "Questions about pending bookings, confirmations, or secure checkout.",
                },
                {
                  title: "Operator verification",
                  description: "Support for business onboarding, documents, and listing approval.",
                },
                {
                  title: "Group trip planning",
                  description: "Need the right camp or trek for a team, school, or weekend group?",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-8">
            <h2 className="text-3xl font-semibold text-slate-900">Frequently asked questions</h2>
            <div className="mt-6 grid gap-4">
              {[
                ["Can I cancel a booking from my dashboard?", "Yes. If your trip is more than 48 hours away and the booking is pending or confirmed, you can cancel it directly from My Bookings."],
                ["How do I contact an operator?", "Each listing includes operator contact details and your confirmation page keeps the important trip information in one place."],
                ["Do you show real ratings?", "Yes. Ratings shown on listings come from completed bookings and eligible user reviews."],
                ["Can I compare activities before booking?", "Yes. Use the compare tool to shortlist up to three experiences and review pricing, duration, and ratings side by side."],
              ].map(([question, answer]) => (
                <div key={question} className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">{question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CustomerFeedback
        title="Support teams use real traveller feedback"
        subtitle="These recent reviews help new customers choose better experiences and help operators maintain quality."
        reviews={feedback}
      />
    </div>
  );
}
