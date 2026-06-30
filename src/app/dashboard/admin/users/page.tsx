import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminUsers } from "@/server/services/admin-service";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/access-denied");

  const params = await searchParams;
  const users = await getAdminUsers(params.query);

  return (
    <div className="container-shell section-spacing space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-slate-900">Users</h1>
        <form>
          <input
            name="query"
            placeholder="Search users"
            defaultValue={params.query}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
        </form>
      </div>
      <div className="card-surface overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Suspended</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.role}</td>
                <td className="py-3">{user.isSuspended ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
