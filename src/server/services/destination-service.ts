import { withPrismaRetry } from "@/lib/prisma";

export async function getDestinations(region?: string, query?: string) {
  const destinations = await withPrismaRetry((db) =>
    db.destination.findMany({
      where: {
        ...(region ? { region } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { district: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        listings: {
          where: { status: "PUBLISHED" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  );

  return destinations.map((destination) => ({
    ...destination,
    listingCount: destination.listings.length,
  }));
}

export async function getDestinationBySlug(slug: string) {
  return withPrismaRetry((db) =>
    db.destination.findUnique({
      where: { slug },
      include: {
        listings: {
          where: { status: "PUBLISHED" },
          orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
          include: {
            category: true,
            operator: true,
            availabilitySlots: {
              where: {
                isActive: true,
                date: { gte: new Date() },
              },
              take: 2,
              orderBy: [{ date: "asc" }],
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
    }),
  );
}

export async function getDestinationInfo(destinationSlug: string) {
  return withPrismaRetry((db) =>
    db.destination.findUnique({
      where: { slug: destinationSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        bestSeason: true,
        district: true,
        region: true,
        description: true,
        latitude: true,
        longitude: true,
        difficultyTags: true,
      },
    }),
  );
}
