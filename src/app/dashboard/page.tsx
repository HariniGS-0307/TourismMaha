import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (session.user.role === "OPERATOR") {
    redirect("/dashboard/operator");
  }

  redirect("/dashboard/user");
}
