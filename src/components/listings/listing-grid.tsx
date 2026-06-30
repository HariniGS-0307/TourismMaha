import { ListingCard } from "@/components/listings/listing-card";
import type { ListingCardData } from "@/types/app";

export function ListingGrid({ listings }: { listings: ListingCardData[] }) {
  if (!listings.length) {
    return (
      <div className="card-surface p-8 text-center text-slate-600">
        No matching listings found. Try another filter combination.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
