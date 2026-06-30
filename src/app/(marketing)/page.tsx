import Image from "next/image";
import Link from "next/link";
import { ListingGrid } from "@/components/listings/listing-grid";
import {
  getFeaturedListings,
  getCategoriesWithCounts,
} from "@/server/services/listing-service";
import { getDestinations } from "@/server/services/destination-service";
import { getDestinationVisual } from "@/lib/destination-visuals";

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();
  const destinations = await getDestinations();
  const categories = await getCategoriesWithCounts();

  return (
    <div>
      <section className="section-spacing">
        <div className="container-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              Full-stack adventure booking platform for Maharashtra
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Discover, compare, and book unforgettable adventures across
              Maharashtra.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              From monsoon treks and lakeside camps to scuba diving and heritage
              cycling loops, find trusted operator-led experiences with live
              pricing and secure checkout.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="rounded-full bg-teal-600 px-6 py-3 font-medium text-white"
              >
                Explore destinations
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700"
              >
                Search listings
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {destinations.slice(0, 4).map((destination) => (
              <div key={destination.id} className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/70 shadow-xl transition duration-500 hover:[transform:perspective(1200px)_rotateX(6deg)_translateY(-8px)]">
                <div className="relative h-44">
                  <Image
                    src={getDestinationVisual(destination.slug, destination.heroImageUrl)}
                    alt={destination.name}
                    fill
                    sizes="(min-width: 640px) 20rem, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">{destination.region}</div>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{destination.name}</h3>
                  <p className="text-sm text-slate-600">{destination.listingCount} experiences</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white/70">
        <div className="container-shell space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
                Browse by activity
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                Top categories
              </h2>
            </div>
            <Link
              href="/activities"
              className="text-sm font-medium text-teal-700"
            >
              See all activities
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/activities/${category.slug}`}
                className="card-surface p-6 transition hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {category.description}
                </p>
                <p className="mt-4 text-sm font-medium text-teal-700">
                  {category.activeListingCount} active listings
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="container-shell space-y-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
              Featured experiences
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Popular adventures this week
            </h2>
          </div>
          <ListingGrid listings={featuredListings} />
        </div>
      </section>
    </div>
  );
}
