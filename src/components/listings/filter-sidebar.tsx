import Link from "next/link";

type FilterValues = {
  query?: string;
  destination?: string;
  category?: string;
  difficulty?: string;
  duration?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
};

type FilterSidebarProps = {
  basePath: string;
  destinations: Array<{ slug: string; name: string }>;
  categories: Array<{ slug: string; name: string }>;
  currentFilters?: FilterValues;
  showCategoryFilter?: boolean;
};

export function FilterSidebar({
  basePath,
  destinations,
  categories,
  currentFilters,
  showCategoryFilter = true,
}: FilterSidebarProps) {
  return (
    <aside className="card-surface h-fit space-y-6 border border-white/60 bg-white/85 p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          Smart filters
        </p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          Refine your shortlist
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Every filter updates the URL, so results stay shareable and bookmarkable.
        </p>
      </div>

      <form action={basePath} method="GET" className="space-y-4">
        <div>
          <label htmlFor="query" className="mb-2 block text-sm font-medium text-slate-700">
            Search
          </label>
          <input
            id="query"
            name="query"
            defaultValue={currentFilters?.query}
            placeholder="Treks, camps, destinations"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label htmlFor="destination" className="mb-2 block text-sm font-medium text-slate-700">
            Destination
          </label>
          <select
            id="destination"
            name="destination"
            defaultValue={currentFilters?.destination ?? ""}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All destinations</option>
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        {showCategoryFilter ? (
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
              Activity
            </label>
            <select
              id="category"
              name="category"
              defaultValue={currentFilters?.category ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">All activities</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label htmlFor="difficulty" className="mb-2 block text-sm font-medium text-slate-700">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={currentFilters?.difficulty ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Any level</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="mb-2 block text-sm font-medium text-slate-700">
              Duration
            </label>
            <select
              id="duration"
              name="duration"
              defaultValue={currentFilters?.duration ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Any duration</option>
              <option value="short">Under 6 hours</option>
              <option value="weekend">Weekend trip</option>
              <option value="multi-day">4+ days</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label htmlFor="minPrice" className="mb-2 block text-sm font-medium text-slate-700">
              Min price
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min="0"
              step="100"
              defaultValue={currentFilters?.minPrice}
              placeholder="₹500"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="mb-2 block text-sm font-medium text-slate-700">
              Max price
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              step="100"
              defaultValue={currentFilters?.maxPrice}
              placeholder="₹2500"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="minRating" className="mb-2 block text-sm font-medium text-slate-700">
            Minimum rating
          </label>
          <select
            id="minRating"
            name="minRating"
            defaultValue={currentFilters?.minRating ?? ""}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Apply filters
          </button>
          <Link
            href={basePath}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            Clear all
          </Link>
        </div>
      </form>

      <div className="rounded-3xl border border-teal-100 bg-teal-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">Quick picks</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`${basePath}?difficulty=easy`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Easy only
          </Link>
          <Link href={`${basePath}?minRating=4`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Rating 4+
          </Link>
          <Link href={`${basePath}?maxPrice=1500`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Under ₹1500
          </Link>
          <Link href={`${basePath}?duration=weekend`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Weekend trips
          </Link>
        </div>
      </div>

      {!showCategoryFilter ? (
        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Browse other activities</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/activities/${category.slug}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
