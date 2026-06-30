import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany({
    include: {
      listings: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      listings: {
        where: { status: "PUBLISHED" },
        include: {
          destination: true,
          category: true,
          operator: {
            include: {
              user: true,
            },
          },
          availabilitySlots: {
            where: { date: { gte: new Date() }, isActive: true },
            orderBy: { date: "asc" },
            take: 3,
          },
          reviews: { select: { rating: true } },
        },
      },
    },
  });
}
