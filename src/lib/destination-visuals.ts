const destinationVisuals: Record<string, string> = {
  lonavala:
    "https://upload.wikimedia.org/wikipedia/commons/5/5d/Mumbai_Pune_Expressway2.jpg",
  bhandardara:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bhandardara_lake.jpg/1920px-Bhandardara_lake.jpg",
  "kaas-plateau":
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Kaas-7016.jpg",
  "harihar-fort":
    "https://upload.wikimedia.org/wikipedia/commons/8/85/Hariharfort.jpg",
  tarkarli:
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Tarkarli_Photo_by_Sandeep_Wairkar.jpg",
  matheran:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Matheran_In_Clouds.jpg/1920px-Matheran_In_Clouds.jpg",
  rajmachi:
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rajmachi.jpg",
  igatpuri:
    "https://upload.wikimedia.org/wikipedia/commons/e/e6/Igatpuri_waterfall.jpg",
  karjat:
    "https://upload.wikimedia.org/wikipedia/commons/0/02/Karjat_-_Murbad_Rd%2C_Neral%2C_Maharashtra_410101%2C_India_-_panoramio.jpg",
  "malshej-ghat":
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
};

export function getDestinationVisual(slug: string, fallback?: string | null) {
  return destinationVisuals[slug] ?? fallback ?? destinationVisuals.lonavala;
}
