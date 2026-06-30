import { NextResponse } from "next/server";
import { getWeatherForCoordinates } from "@/server/services/weather-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lon"));

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 },
    );
  }

  const weather = await getWeatherForCoordinates(latitude, longitude);
  return NextResponse.json(weather);
}
