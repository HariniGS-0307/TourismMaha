"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CompareTable } from "@/components/listings/compare-table";
import { useCompare } from "@/hooks/use-compare";
import type { ListingCardData } from "@/types/app";

export default function ComparePage() {
  const compare = useCompare();
  const [listings, setListings] = useState<ListingCardData[] | null>(null);

  useEffect(() => {
    if (!compare.ids.length) {
      return;
    }

    let cancelled = false;

    fetch(`/api/listings?ids=${compare.ids.join(",")}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) {
          return;
        }

        const ordered = compare.ids
          .map((id) => data.find((listing) => listing.id === id))
          .filter(Boolean) as ListingCardData[];

        setListings(ordered);
      })
      .catch(() => {
        if (!cancelled) {
          setListings([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [compare.ids]);

  const selectionLabel = useMemo(() => {
    if (!compare.ids.length) {
      return "No listings selected yet";
    }

    return `${compare.ids.length} of 3 listings selected`;
  }, [compare.ids.length]);

  const isLoading = compare.ids.length > 0 && listings === null;
  const resolvedListings = compare.ids.length ? listings ?? [] : [];

  return (
    <div className="container-shell section-spacing space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_28%),linear-gradient(135deg,_#020617,_#0f766e_55%,_#0f172a)] p-8 text-white shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
              Compare
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              Compare up to 3 listings side by side
            </h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Shortlist adventures, then compare price, duration, difficulty,
              rating, destination, and operator before you book.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              {selectionLabel}
            </span>
            <button
              type="button"
              onClick={compare.clear}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Clear compare
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="card-surface p-8 text-center text-slate-600">
          Loading your comparison shortlist...
        </div>
      ) : compare.isReady && !compare.ids.length ? (
        <div className="card-surface space-y-4 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Select up to 3 listings to compare
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600">
            Use the compare checkbox on any listing card from Explore, Search,
            Activities, or destination pages.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="rounded-full bg-teal-600 px-5 py-3 text-sm font-medium text-white"
            >
              Browse listings
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Explore destinations
            </Link>
          </div>
        </div>
      ) : (
        <CompareTable listings={resolvedListings} />
      )}
    </div>
  );
}
