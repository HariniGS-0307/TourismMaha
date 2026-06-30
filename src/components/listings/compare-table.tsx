import { formatCurrency } from "@/lib/utils";
import type { ListingCardData } from "@/types/app";

export function CompareTable({ listings }: { listings: ListingCardData[] }) {
  if (!listings.length) {
    return (
      <div className="card-surface p-8 text-center text-slate-600">
        Select up to 3 listings to compare.
      </div>
    );
  }

  const rows = [
    {
      label: "Price",
      render: (listing: ListingCardData) =>
        formatCurrency(listing.discountPrice ?? listing.pricePerPerson),
    },
    {
      label: "Duration",
      render: (listing: ListingCardData) =>
        listing.durationDays
          ? `${listing.durationDays} day(s)`
          : `${listing.durationHours} hrs`,
    },
    {
      label: "Difficulty",
      render: (listing: ListingCardData) => listing.difficultyLevel,
    },
    {
      label: "Destination",
      render: (listing: ListingCardData) => listing.destination?.name ?? "Destination",
    },
    {
      label: "Rating",
      render: (listing: ListingCardData) => listing.avgRating.toFixed(1),
    },
    {
      label: "Operator",
      render: (listing: ListingCardData) => listing.operator?.businessName ?? "Operator",
    },
    { label: "Inclusions", render: () => "See listing details" },
  ];

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-900">Feature</th>
            {listings.map((listing) => (
              <th
                key={listing.id}
                className="min-w-60 px-4 py-3 font-semibold text-slate-900"
              >
                {listing.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-slate-200">
              <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
              {listings.map((listing) => (
                <td
                  key={`${row.label}-${listing.id}`}
                  className="px-4 py-3 text-slate-600"
                >
                  {row.render(listing)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
