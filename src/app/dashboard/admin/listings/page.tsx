import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminListings } from "@/server/services/admin-service";

export default async function AdminListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/access-denied");

  const listings = await getAdminListings();

  return (
    <div className="container-shell section-spacing space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">
        Listings moderation
      </h1>
      <div className="card-surface overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Title</th>
              <th className="py-2">Operator</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-slate-200">
                <td className="py-3">{listing.title}</td>
                <td className="py-3">{listing.operator.businessName}</td>
                <td className="py-3">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
