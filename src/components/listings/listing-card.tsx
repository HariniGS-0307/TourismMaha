"use client";

import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/hooks/use-compare";
import { getPrimaryListingVisual } from "@/lib/listing-visuals";
import { formatCurrency } from "@/lib/utils";
import type { ListingCardData } from "@/types/app";

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const compare = useCompare();
  const effectivePrice = listing.discountPrice ?? listing.pricePerPerson;
  const destinationName = listing.destination?.name ?? "Destination";
  const destinationDistrict = listing.destination?.district ?? "Maharashtra";
  const categoryName = listing.category?.name ?? "Adventure";
  const reviewCount = listing._count?.reviews ?? 0;
  const availabilitySlots = listing.availabilitySlots ?? [];
  const primaryImage = getPrimaryListingVisual({
    listingSlug: listing.slug,
    destinationSlug: listing.destination?.slug,
    images: listing.images,
  });
  const spotsLeft = availabilitySlots.reduce(
    (sum, slot) => sum + (slot.capacity - slot.bookedCount),
    0,
  );

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/90 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)] transition duration-500 hover:[transform:perspective(1400px)_rotateX(6deg)_translateY(-10px)] hover:shadow-[0_35px_90px_-30px_rgba(13,148,136,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_34%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="relative h-56 overflow-hidden">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
          {categoryName}
        </div>
      </div>
      <div className="relative space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {destinationName}, {destinationDistrict}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              {listing.title}
            </h3>
          </div>
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <input
              type="checkbox"
              checked={compare.isSelected(listing.id)}
              onChange={() => compare.toggle(listing.id)}
              disabled={!compare.isSelected(listing.id) && compare.isFull}
            />
            Compare
          </label>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {listing.shortDescription}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {listing.difficultyLevel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {listing.durationDays
              ? `${listing.durationDays} day${listing.durationDays > 1 ? "s" : ""}`
              : `${listing.durationHours} hrs`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            <Star className="h-3.5 w-3.5 fill-current" />
            {listing.avgRating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            {listing.discountPrice ? (
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(listing.pricePerPerson)}
              </p>
            ) : null}
            <p className="text-2xl font-semibold text-slate-900">
              {formatCurrency(effectivePrice)}
            </p>
            <p className="text-xs text-slate-500">
              per person · {Math.max(spotsLeft, 0)} spots left
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/listings/${listing.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Details
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/booking/${listing.id}`}
              className="rounded-full bg-teal-600 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-teal-500"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
