import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOperatorAnalytics } from "@/server/services/operator-service";

export default async function OperatorAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OPERATOR") redirect("/access-denied");

  const analytics = await getOperatorAnalytics(session.user.id);

  return (
    <div className="container-shell section-spacing space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {analytics.chart.map((item) => (
          <div key={item.day} className="card-surface p-5">
            <p className="text-sm text-slate-500">{item.day}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              ₹{item.revenue}
            </p>
          </div>
        ))}
      </div>
      <div className="card-surface p-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Top performing listings
        </h2>
        <div className="mt-4 space-y-3">
          {analytics.topListings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-900">
                  {listing.title}
                </span>
                <span>₹{listing.revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
