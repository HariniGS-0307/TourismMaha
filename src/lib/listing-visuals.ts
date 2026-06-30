import { getDestinationVisual } from "@/lib/destination-visuals";

const listingVisualOverrides: Record<string, string[]> = {
  "harihar-fort-summit-trek": [
    "https://upload.wikimedia.org/wikipedia/commons/8/85/Hariharfort.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rajmachi.jpg",
  ],
  "rajmachi-overnight-camping-trek": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rajmachi.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bhandardara_lake.jpg/1920px-Bhandardara_lake.jpg",
  ],
  "lonavala-waterfall-trek": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5d/Mumbai_Pune_Expressway2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e6/Igatpuri_waterfall.jpg",
  ],
  "bhandardara-fireflies-special-camp": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bhandardara_lake.jpg/1920px-Bhandardara_lake.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Kaas-7016.jpg",
  ],
  "tarkarli-scuba-discovery": [
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Tarkarli_Photo_by_Sandeep_Wairkar.jpg",
  ],
};

export function getListingVisuals(params: {
  listingSlug: string;
  destinationSlug?: string;
  images?: string[] | null;
}) {
  const overrideImages = listingVisualOverrides[params.listingSlug] ?? [];
  const fallbackImages = params.images?.filter(Boolean) ?? [];
  const destinationImage = params.destinationSlug
    ? [getDestinationVisual(params.destinationSlug)]
    : [];

  const merged = [...overrideImages, ...fallbackImages, ...destinationImage];
  return Array.from(new Set(merged)).filter(Boolean);
}

export function getPrimaryListingVisual(params: {
  listingSlug: string;
  destinationSlug?: string;
  images?: string[] | null;
}) {
  return (
    getListingVisuals(params)[0] ??
    getDestinationVisual(params.destinationSlug ?? "lonavala")
  );
}
