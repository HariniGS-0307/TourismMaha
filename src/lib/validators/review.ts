import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  listingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
  images: z.array(z.string()).optional().default([]),
});

export const reviewReplySchema = z.object({
  reviewId: z.string().min(1),
  reply: z.string().trim().min(5).max(500),
});
