import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminOperators } from "@/server/services/admin-service";

export default async function AdminOperatorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/access-denied");

  const operators = await getAdminOperators();

  return (
    <div className="container-shell section-spacing space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Operators</h1>
      <div className="card-surface overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Business</th>
              <th className="py-2">Owner</th>
              <th className="py-2">Verified</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator) => (
              <tr key={operator.id} className="border-t border-slate-200">
                <td className="py-3">{operator.businessName}</td>
                <td className="py-3">{operator.user.email}</td>
                <td className="py-3">
                  {operator.isVerified ? "Yes" : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
