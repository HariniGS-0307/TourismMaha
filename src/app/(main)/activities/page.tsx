import Link from "next/link";
import { getCategoriesWithCounts } from "@/server/services/listing-service";

export default async function ActivitiesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="container-shell section-spacing space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Activities
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">
          Browse by adventure type
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/activities/${category.slug}`}
            className="card-surface p-6 transition hover:-translate-y-1"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              {category.name}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {category.description}
            </p>
            <p className="mt-6 text-sm font-medium text-teal-700">
              {category.activeListingCount} active listings
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
