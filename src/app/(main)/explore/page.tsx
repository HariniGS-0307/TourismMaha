import Image from "next/image";
import Link from "next/link";
import { getDestinationVisual } from "@/lib/destination-visuals";
import { getDestinations } from "@/server/services/destination-service";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; query?: string }>;
}) {
  const params = await searchParams;
  const destinations = await getDestinations(params.region, params.query);

  return (
    <div className="container-shell section-spacing space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Explore Maharashtra
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            Destinations worth the detour
          </h1>
        </div>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            name="query"
            defaultValue={params.query}
            placeholder="Search destinations or districts"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            name="region"
            defaultValue={params.region}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">All regions</option>
            <option value="Western Ghats">Western Ghats</option>
            <option value="Konkan Coast">Konkan Coast</option>
            <option value="Vidarbha">Vidarbha</option>
            <option value="Marathwada">Marathwada</option>
          </select>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {destinations.map((destination) => (
          <Link
            key={destination.id}
            href={`/destinations/${destination.slug}`}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-500 hover:[transform:perspective(1200px)_rotateX(5deg)_translateY(-10px)] hover:shadow-2xl"
          >
            <div className="relative h-56">
              <Image
                src={getDestinationVisual(destination.slug, destination.heroImageUrl)}
                alt={destination.name}
                fill
                sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-white/80">{destination.district}</p>
                  <h2 className="text-2xl font-semibold text-white">{destination.name}</h2>
                </div>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">
                  {destination.bestSeason}
                </span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm leading-6 text-slate-600">{destination.description}</p>
              <p className="mt-6 text-sm font-medium text-slate-900">{destination.listingCount} published experiences</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
