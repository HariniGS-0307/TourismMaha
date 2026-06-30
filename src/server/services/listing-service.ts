import {
  Prisma,
  type DifficultyLevel,
  type ListingStatus,
} from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { calculateDiscountedPrice } from "@/lib/utils";

type ListingFilters = {
  query?: string;
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
  duration?: string;
  minRating?: number;
  status?: string;
};

const listingCardSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  pricePerPerson: true,
  discountPrice: true,
  durationHours: true,
  durationDays: true,
  difficultyLevel: true,
  images: true,
  avgRating: true,
  status: true,
  destination: {
    select: {
      name: true,
      slug: true,
      district: true,
      region: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
      icon: true,
    },
  },
  operator: {
    select: {
      id: true,
      businessName: true,
      isVerified: true,
      rating: true,
      totalBookings: true,
      phone: true,
    },
  },
  availabilitySlots: {
    where: {
      isActive: true,
      date: {
        gte: new Date(),
      },
    },
    orderBy: [{ date: "asc" }],
    take: 3,
    select: {
      id: true,
      date: true,
      capacity: true,
      bookedCount: true,
    },
  },
  _count: {
    select: {
      reviews: true,
      favorites: true,
    },
  },
} satisfies Prisma.ListingSelect;

function buildWhere(filters: ListingFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {};

  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: "insensitive" } },
      { shortDescription: { contains: filters.query, mode: "insensitive" } },
      {
        destination: { name: { contains: filters.query, mode: "insensitive" } },
      },
      { category: { name: { contains: filters.query, mode: "insensitive" } } },
    ];
  }

  if (filters.destination) {
    where.destination = {
      slug: filters.destination,
    };
  }

  if (filters.category) {
    where.category = {
      slug: filters.category,
    };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.pricePerPerson = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.difficulty) {
    where.difficultyLevel = filters.difficulty.toUpperCase() as DifficultyLevel;
  }

  if (filters.minRating) {
    where.avgRating = {
      gte: filters.minRating,
    };
  }

  if (filters.duration === "short") {
    where.durationHours = { lte: 6 };
  }

  if (filters.duration === "weekend") {
    where.durationDays = { gte: 2, lte: 3 };
  }

  if (filters.duration === "multi-day") {
    where.durationDays = { gte: 4 };
  }

  if (filters.status) {
    where.status = filters.status.toUpperCase() as ListingStatus;
  } else {
    where.status = "PUBLISHED";
  }

  return where;
}

export async function getFeaturedListings() {
  return withPrismaRetry((db) =>
    db.listing.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: listingCardSelect,
    }),
  );
}

export async function getListings(filters: ListingFilters = {}) {
  return withPrismaRetry((db) =>
    db.listing.findMany({
      where: buildWhere(filters),
      orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
      select: listingCardSelect,
    }),
  );
}

export async function getListingById(id: string) {
  return withPrismaRetry((db) =>
    db.listing.findUnique({
      where: { id },
      include: {
        destination: true,
        category: true,
        operator: {
          include: {
            user: true,
          },
        },
        itineraryDays: {
          orderBy: { dayNumber: "asc" },
        },
        availabilitySlots: {
          where: {
            isActive: true,
            date: { gte: new Date() },
          },
          orderBy: [{ date: "asc" }],
          take: 12,
        },
        reviews: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            bookings: true,
          },
        },
      },
    }),
  );
}

export async function getListingBySlug(slug: string) {
  return withPrismaRetry((db) =>
    db.listing.findUnique({
      where: { slug },
      select: listingCardSelect,
    }),
  );
}

export async function getListingsByIds(ids: string[]) {
  return withPrismaRetry((db) =>
    db.listing.findMany({
      where: {
        id: { in: ids },
        status: "PUBLISHED",
      },
      select: listingCardSelect,
    }),
  );
}

export async function getCategoriesWithCounts() {
  const categories = await withPrismaRetry((db) =>
    db.category.findMany({
      include: {
        _count: {
          select: {
            listings: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  );

  return categories.map((category) => ({
    ...category,
    activeListingCount: category._count.listings,
  }));
}

export async function getCategoryPageData(
  slug: string,
  filters: ListingFilters = {},
) {
  const category = await withPrismaRetry((db) =>
    db.category.findUnique({
      where: { slug },
    }),
  );

  if (!category) {
    return null;
  }

  const listings = await getListings({
    ...filters,
    category: slug,
  });

  return {
    category,
    listings,
  };
}

export async function toggleFavorite(userId: string, listingId: string) {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });

    return { favorited: false };
  }

  await prisma.favorite.create({
    data: {
      userId,
      listingId,
    },
  });

  return { favorited: true };
}

export async function getSearchSuggestions(query: string) {
  if (!query) {
    return [];
  }

  return withPrismaRetry((db) =>
    db.listing.findMany({
      where: buildWhere({ query }),
      take: 5,
      select: listingCardSelect,
    }),
  );
}

export function getEffectivePrice(pricePerPerson: number, discountPrice?: number | null) {
  return calculateDiscountedPrice(pricePerPerson, discountPrice);
}
