import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getListingById,
  toggleFavorite,
} from "@/server/services/listing-service";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PATCH(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const result = await toggleFavorite(session.user.id, id);
  return NextResponse.json(result);
}
