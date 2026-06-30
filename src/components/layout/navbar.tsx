"use client";

import { Bell, Menu, Mountain, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useCompare } from "@/hooks/use-compare";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const compare = useCompare();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotificationCount(data.filter((item) => !item.isRead).length);
        }
      })
      .catch(() => undefined);
  }, [session?.user]);

  const dashboardHref =
    session?.user.role === "ADMIN"
      ? "/dashboard/admin"
      : session?.user.role === "OPERATOR"
        ? "/dashboard/operator"
        : "/dashboard/user";

  const compareLabel = compare.ids.length ? `Compare (${compare.ids.length})` : "Compare";

  function navLinkClass(href: string) {
    const active = href === "/" ? pathname === href : pathname.startsWith(href);
    return active
      ? "rounded-full bg-slate-900 px-3 py-2 text-white shadow-sm"
      : "rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900"
        >
          <div className="rounded-2xl bg-teal-600 p-2 text-white shadow-lg shadow-teal-500/20">
            <Mountain className="h-4 w-4" />
          </div>
          <span>Maharashtra Adventures</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          <Link href="/" className={navLinkClass("/")}>Home</Link>
          <Link href="/explore" className={navLinkClass("/explore")}>Explore</Link>
          <Link href="/activities" className={navLinkClass("/activities")}>Activities</Link>
          <Link href="/search" className={navLinkClass("/search")}>Search</Link>
          <Link href="/about" className={navLinkClass("/about")}>About</Link>
          <Link href="/contact" className={navLinkClass("/contact")}>Contact</Link>
          <Link href="/compare" className={`${navLinkClass("/compare")} inline-flex items-center gap-2`}>
            Compare
            {compare.ids.length ? (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                {compare.ids.length}
              </span>
            ) : null}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <Link
                href="/dashboard/user"
                className="relative rounded-full border border-slate-200 p-2 text-slate-700"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href={dashboardHref}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-teal-600 px-4 py-2 text-sm text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-full border border-slate-200 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell flex flex-col gap-4 py-4 text-sm">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/explore" onClick={() => setOpen(false)}>
              Explore
            </Link>
            <Link href="/activities" onClick={() => setOpen(false)}>
              Activities
            </Link>
            <Link href="/search" onClick={() => setOpen(false)}>
              Search
            </Link>
            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <Link href="/compare" onClick={() => setOpen(false)}>
              {compareLabel}
            </Link>
            {session?.user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-left text-white"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
