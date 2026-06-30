import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="container-shell section-spacing">
      <div className="card-surface mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
        <p className="mt-3 text-slate-600">
          You do not have permission to access this route with your current
          account.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-3 text-white"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
