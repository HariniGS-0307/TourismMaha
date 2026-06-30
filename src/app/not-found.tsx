import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell section-spacing">
      <div className="card-surface mx-auto max-w-xl p-10 text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The trail you were looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-teal-600 px-5 py-3 text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
