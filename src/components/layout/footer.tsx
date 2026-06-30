import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="container-shell flex flex-col gap-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">Maharashtra Adventures</p>
          <p>
            Discover, compare, and book unforgettable experiences across
            Maharashtra.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/activities">Activities</Link>
        </div>
      </div>
    </footer>
  );
}
