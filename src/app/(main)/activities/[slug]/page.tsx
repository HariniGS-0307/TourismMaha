import { notFound } from "next/navigation";
import { FilterSidebar } from "@/components/listings/filter-sidebar";
import { ListingGrid } from "@/components/listings/listing-grid";
import { getDestinations } from "@/server/services/destination-service";
import {
  getCategoriesWithCounts,
  getCategoryPageData,
} from "@/server/services/listing-service";

export default async function ActivityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    query?: string;
    destination?: string;
    difficulty?: string;
    maxPrice?: string;
    minPrice?: string;
    minRating?: string;
    duration?: string;
  }>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const destinations = await getDestinations();
  const categories = await getCategoriesWithCounts();

  const data = await getCategoryPageData(slug, {
    query: filters.query,
    destination: filters.destination,
    difficulty: filters.difficulty,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    minRating: filters.minRating ? Number(filters.minRating) : undefined,
    duration: filters.duration,
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="container-shell section-spacing grid gap-8 lg:grid-cols-[20rem_1fr]">
      <FilterSidebar
        basePath={`/activities/${slug}`}
        destinations={destinations}
        categories={categories}
        currentFilters={filters}
        showCategoryFilter={false}
      />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_26%),linear-gradient(135deg,_#020617,_#115e59_55%,_#0f172a)] p-8 text-white shadow-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
            Activity
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{data.category.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-200">{data.category.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-100">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
              {data.listings.length} matching listings
            </span>
            {filters.destination ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                Destination: {filters.destination}
              </span>
            ) : null}
            {filters.maxPrice ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                Max ₹{filters.maxPrice}
              </span>
            ) : null}
          </div>
        </div>
        <ListingGrid listings={data.listings} />
      </div>
    </div>
  );
}
