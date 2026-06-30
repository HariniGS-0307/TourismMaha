import { FilterSidebar } from "@/components/listings/filter-sidebar";
import { ListingGrid } from "@/components/listings/listing-grid";
import { getDestinations } from "@/server/services/destination-service";
import {
  getCategoriesWithCounts,
  getListings,
} from "@/server/services/listing-service";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    destination?: string;
    category?: string;
    difficulty?: string;
    maxPrice?: string;
    minPrice?: string;
    minRating?: string;
    duration?: string;
  }>;
}) {
  const filters = await searchParams;
  const destinations = await getDestinations();
  const categories = await getCategoriesWithCounts();

  const listings = await getListings({
    query: filters.query,
    destination: filters.destination,
    category: filters.category,
    difficulty: filters.difficulty,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    minRating: filters.minRating ? Number(filters.minRating) : undefined,
    duration: filters.duration,
  });

  return (
    <div className="container-shell section-spacing grid gap-8 lg:grid-cols-[20rem_1fr]">
      <FilterSidebar
        basePath="/search"
        destinations={destinations}
        categories={categories}
        currentFilters={filters}
      />
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_32%),linear-gradient(135deg,_#020617,_#0f766e_55%,_#0f172a)] p-8 text-white shadow-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
            Search and compare
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            Find the right adventure in seconds
          </h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Search by destination, category, budget, difficulty, and rating.
            Your filters stay in the URL so you can share the exact shortlist.
          </p>
          <form action="/search" method="GET" className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              name="query"
              defaultValue={filters.query}
              placeholder="Search listings, destinations, categories"
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-200/30"
            />
            <button
              type="submit"
              className="rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:-translate-y-0.5"
            >
              Search now
            </button>
          </form>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Showing results</p>
            <p className="text-lg font-semibold text-slate-900">
              {listings.length} curated experience{listings.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            {filters.destination ? <span className="rounded-full bg-slate-100 px-3 py-1">Destination: {filters.destination}</span> : null}
            {filters.category ? <span className="rounded-full bg-slate-100 px-3 py-1">Activity: {filters.category}</span> : null}
            {filters.difficulty ? <span className="rounded-full bg-slate-100 px-3 py-1">Difficulty: {filters.difficulty}</span> : null}
            {filters.maxPrice ? <span className="rounded-full bg-slate-100 px-3 py-1">Under ₹{filters.maxPrice}</span> : null}
            {filters.minRating ? <span className="rounded-full bg-slate-100 px-3 py-1">Rated {filters.minRating}+ </span> : null}
          </div>
        </div>

        <ListingGrid listings={listings} />
      </div>
    </div>
  );
}
