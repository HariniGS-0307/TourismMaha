import Link from "next/link";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { auth } from "@/lib/auth";
import { getOperatorDashboard } from "@/server/services/operator-service";

export default async function OperatorDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const dashboard = await getOperatorDashboard(session.user.id);

  return (
    <div className="container-shell section-spacing space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Operator dashboard
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            {dashboard.operator.businessName}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/operator/listings"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          >
            Manage listings
          </Link>
          <Link
            href="/dashboard/operator/analytics"
            className="rounded-full bg-teal-600 px-4 py-2 text-sm text-white"
          >
            View analytics
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total listings"
          value={dashboard.stats.totalListings}
        />
        <StatsCard
          label="Bookings this month"
          value={dashboard.stats.totalBookingsThisMonth}
        />
        <StatsCard
          label="Revenue"
          value={dashboard.stats.totalRevenue}
          currency
        />
        <StatsCard
          label="Average rating"
          value={Number(dashboard.stats.averageRating.toFixed(1))}
        />
      </div>

      <section className="card-surface p-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Recent bookings
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="py-2">Traveller</th>
                <th className="py-2">Listing</th>
                <th className="py-2">Trip date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-slate-200">
                  <td className="py-3">
                    {booking.user.name ?? booking.user.email}
                  </td>
                  <td className="py-3">{booking.listing.title}</td>
                  <td className="py-3">
                    {new Date(booking.tripDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
