import { z } from "zod";

export const createBookingSchema = z.object({
  listingId: z.string().min(1),
  slotId: z.string().min(1),
  numberOfPeople: z.number().int().positive(),
  couponCode: z.string().trim().optional(),
  specialRequests: z.string().trim().max(500).optional(),
});

export const createOrderSchema = z.object({
  bookingId: z.string().min(1),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
