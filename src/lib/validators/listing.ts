import { z } from "zod";

const optionalString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  },
  z.string().optional(),
);

const optionalNumber = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? Number(trimmed) : undefined;
}, z.number().optional());

export const listingFilterSchema = z.object({
  query: optionalString,
  destination: optionalString,
  category: optionalString,
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  difficulty: optionalString,
  duration: optionalString,
  minRating: optionalNumber,
  status: optionalString,
});
