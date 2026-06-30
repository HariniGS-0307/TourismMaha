import { prisma } from "@/lib/prisma";

export function isReviewAllowed(input: {
  bookingUserId: string;
  currentUserId: string;
  bookingStatus: string;
  hasReview: boolean;
}) {
  return (
    input.bookingUserId === input.currentUserId &&
    input.bookingStatus === "COMPLETED" &&
    !input.hasReview
  );
}

export async function canReviewBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) {
    return false;
  }

  return isReviewAllowed({
    bookingUserId: booking.userId,
    currentUserId: userId,
    bookingStatus: booking.status,
    hasReview: Boolean(booking.review),
  });
}

export async function createReview(input: {
  userId: string;
  bookingId: string;
  listingId: string;
  rating: number;
  comment: string;
  images: string[];
}) {
  const allowed = await canReviewBooking(input.userId, input.bookingId);

  if (!allowed) {
    throw new Error("You are not allowed to review this booking.");
  }

  const review = await prisma.review.create({
    data: input,
  });

  await recalculateRatings(input.listingId);
  return review;
}

export async function replyToReview(
  operatorUserId: string,
  reviewId: string,
  reply: string,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      listing: {
        include: {
          operator: true,
        },
      },
    },
  });

  if (!review || review.listing.operator.userId !== operatorUserId) {
    throw new Error("Review not found.");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: { reply },
  });
}

export async function getRecentPublicReviews(limit = 3) {
  return prisma.review.findMany({
    include: {
      user: {
        select: { name: true },
      },
      listing: {
        include: {
          destination: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getListingReviews(
  listingId: string,
  page = 1,
  pageSize = 5,
) {
  const reviews = await prisma.review.findMany({
    where: { listingId },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  const total = await prisma.review.count({ where: { listingId } });
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { listingId },
    _count: { rating: true },
    orderBy: { rating: "asc" },
  });

  return {
    reviews,
    total,
    distribution: grouped.map((item) => ({
      rating: item.rating,
      count: item._count.rating,
    })),
  };
}

export async function recalculateRatings(listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      reviews: true,
      operator: {
        include: {
          listings: {
            include: {
              reviews: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    return;
  }

  const listingRatings = listing.reviews.map((review) => review.rating);
  const listingAverage = listingRatings.length
    ? listingRatings.reduce((sum, value) => sum + value, 0) /
      listingRatings.length
    : 0;

  await prisma.listing.update({
    where: { id: listingId },
    data: { avgRating: listingAverage },
  });

  const operatorRatings = listing.operator.listings.flatMap((item) =>
    item.reviews.map((review) => review.rating),
  );
  const operatorAverage = operatorRatings.length
    ? operatorRatings.reduce((sum, value) => sum + value, 0) /
      operatorRatings.length
    : 0;

  await prisma.operatorProfile.update({
    where: { id: listing.operatorId },
    data: { rating: operatorAverage },
  });
}
