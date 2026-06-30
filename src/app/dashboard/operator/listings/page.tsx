import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOperatorListings } from "@/server/services/operator-service";

export default async function OperatorListingsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "OPERATOR") redirect("/access-denied");

  const listings = await getOperatorListings(session.user.id);

  return (
    <div className="container-shell section-spacing space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Your listings</h1>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          Create/edit flow can be extended here
        </span>
      </div>
      <div className="card-surface overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Title</th>
              <th className="py-2">Destination</th>
              <th className="py-2">Category</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-slate-200">
                <td className="py-3">{listing.title}</td>
                <td className="py-3">{listing.destination.name}</td>
                <td className="py-3">{listing.category.name}</td>
                <td className="py-3">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
