import Link from "next/link";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/server/services/admin-service";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/access-denied");

  const overview = await getAdminOverview();

  return (
    <div className="container-shell section-spacing space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Admin panel
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            Platform overview
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link
            href="/dashboard/admin/operators"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            Operators
          </Link>
          <Link
            href="/dashboard/admin/listings"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            Listings
          </Link>
          <Link
            href="/dashboard/admin/users"
            className="rounded-full border border-slate-200 px-4 py-2"
          >
            Users
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Users" value={overview.stats.totalUsers} />
        <StatsCard label="Operators" value={overview.stats.totalOperators} />
        <StatsCard label="Listings" value={overview.stats.totalListings} />
        <StatsCard label="Bookings" value={overview.stats.totalBookings} />
        <StatsCard
          label="GMV this month"
          value={overview.stats.gmvThisMonth}
          currency
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.chart.slice(-6).map((point) => (
          <div key={point.day} className="card-surface p-5">
            <p className="text-sm text-slate-500">{point.day}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {point.bookings}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
