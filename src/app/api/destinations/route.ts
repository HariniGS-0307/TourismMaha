import { NextResponse } from "next/server";
import { getDestinations } from "@/server/services/destination-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;
  const query = searchParams.get("query") ?? undefined;
  const destinations = await getDestinations(region, query);
  return NextResponse.json(destinations);
}
