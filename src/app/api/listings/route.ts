import { NextResponse } from "next/server";
import { listingFilterSchema } from "@/lib/validators/listing";
import {
  getListings,
  getListingsByIds,
} from "@/server/services/listing-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (ids) {
    const listings = await getListingsByIds(ids.split(",").filter(Boolean));
    return NextResponse.json(listings);
  }

  const parsed = listingFilterSchema.safeParse({
    query: searchParams.get("query") ?? undefined,
    destination: searchParams.get("destination") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    duration: searchParams.get("duration") ?? undefined,
    minRating: searchParams.get("minRating") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const listings = await getListings(parsed.data);
  return NextResponse.json(listings);
}
