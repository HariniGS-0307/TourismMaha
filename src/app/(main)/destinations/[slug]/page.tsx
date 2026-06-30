import Image from "next/image";
import { notFound } from "next/navigation";
import { ListingGrid } from "@/components/listings/listing-grid";
import { getDestinationBySlug } from "@/server/services/destination-service";
import { getListings } from "@/server/services/listing-service";
import { getDestinationVisual } from "@/lib/destination-visuals";
import { getWeatherForCoordinates } from "@/server/services/weather-service";

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const weather = await getWeatherForCoordinates(
    destination.latitude,
    destination.longitude,
  );
  const listings = await getListings({ destination: slug });

  return (
    <div className="container-shell section-spacing space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl">
        <div className="absolute inset-0">
          <Image
            src={getDestinationVisual(destination.slug, destination.heroImageUrl)}
            alt={destination.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/40" />
        </div>
        <div className="relative p-8 md:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">{destination.region}</p>
          <h1 className="mt-2 text-4xl font-semibold">{destination.name}</h1>
          <p className="mt-4 max-w-3xl text-slate-200">{destination.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">District</p>
              <p className="mt-2 font-medium text-white">{destination.district}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">Best season</p>
              <p className="mt-2 font-medium text-white">{destination.bestSeason}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">Weather now</p>
              <p className="mt-2 font-medium text-white">{weather.current.summary} · {weather.current.temperature}°C</p>
            </div>
          </div>
          {weather.warning ? <p className="mt-4 rounded-2xl bg-amber-100/95 px-4 py-3 text-sm text-amber-900">{weather.warning}</p> : null}
        </div>
      </section>

      <section className="card-surface p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Map and route</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            title={`${destination.name} map`}
            src={`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}&z=11&output=embed`}
            className="h-80 w-full"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            Published experiences
          </h2>
          <p className="mt-2 text-slate-600">
            Book guided activities and operator-led trips around{" "}
            {destination.name}.
          </p>
        </div>
        <ListingGrid listings={listings} />
      </section>
    </div>
  );
}
