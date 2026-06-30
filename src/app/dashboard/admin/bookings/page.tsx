import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getAdminBookings } from "@/server/services/admin-service";

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/access-denied");

  const bookings = await getAdminBookings();

  return (
    <div className="container-shell section-spacing space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Bookings</h1>
      <div className="card-surface overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Reference</th>
              <th className="py-2">User</th>
              <th className="py-2">Listing</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-slate-200">
                <td className="py-3">{booking.bookingReference}</td>
                <td className="py-3">{booking.user.email}</td>
                <td className="py-3">{booking.listing.title}</td>
                <td className="py-3">{formatCurrency(booking.totalAmount)}</td>
                <td className="py-3">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
