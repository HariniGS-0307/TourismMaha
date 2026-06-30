import type { MetadataRoute } from "next";
import { getDestinations } from "@/server/services/destination-service";
import { getListings } from "@/server/services/listing-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await getDestinations();
  const listings = await getListings();

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "",
    "/explore",
    "/activities",
    "/search",
    "/compare",
    "/about",
    "/contact",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...destinations.map((destination) => ({
      url: `${baseUrl}/destinations/${destination.slug}`,
      lastModified: new Date(),
    })),
    ...listings.map((listing) => ({
      url: `${baseUrl}/listings/${listing.id}`,
      lastModified: new Date(),
    })),
  ];
}
