"use client";

import { ArrowLeft, Compass, Home, LayoutDashboard, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function PageToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === "/") {
    return null;
  }

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/dashboard/admin"
      : session?.user?.role === "OPERATOR"
        ? "/dashboard/operator"
        : "/dashboard/user";

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-3">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
          >
            <Compass className="h-4 w-4" />
            Explore
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          {session?.user ? (
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 font-medium text-teal-700 transition hover:bg-teal-100"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
