import { prisma } from "@/lib/prisma";
import { getDestinationInfo } from "@/server/services/destination-service";
import { getListings } from "@/server/services/listing-service";
import { getUserBookings } from "@/server/services/booking-service";

const sessionRateLimit = new Map<string, { count: number; minute: number }>();

const DESTINATION_SLUGS = [
  "lonavala",
  "bhandardara",
  "kaas-plateau",
  "harihar-fort",
  "tarkarli",
  "matheran",
  "rajmachi",
  "igatpuri",
  "karjat",
  "malshej-ghat",
] as const;

type ChatCard = {
  type: "listing" | "booking";
  title: string;
  subtitle: string;
  href: string;
  badges: string[];
};

function enforceRateLimit(sessionId: string) {
  const minute = Math.floor(Date.now() / 60000);
  const current = sessionRateLimit.get(sessionId);

  if (!current || current.minute !== minute) {
    sessionRateLimit.set(sessionId, { count: 1, minute });
    return;
  }

  if (current.count >= 20) {
    throw new Error(
      "Rate limit exceeded. Please wait a moment before sending another message.",
    );
  }

  current.count += 1;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTripDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extractDestinationSlug(message: string) {
  const lower = message.toLowerCase();
  return (
    DESTINATION_SLUGS.find((slug) =>
      lower.includes(slug.replace(/-/g, " ")) || lower.includes(slug),
    ) ?? null
  );
}

function extractCategorySlug(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("trek")) return "trekking";
  if (lower.includes("camp")) return "camping";
  if (lower.includes("water") || lower.includes("scuba") || lower.includes("snorkel")) return "water-sports";
  if (lower.includes("wildlife") || lower.includes("safari")) return "wildlife-safari";
  if (lower.includes("cycl")) return "cycling";
  if (lower.includes("heritage") || lower.includes("fort walk")) return "heritage-trails";
  return undefined;
}

function extractDifficulty(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("easy")) return "easy";
  if (lower.includes("moderate")) return "moderate";
  if (lower.includes("hard")) return "hard";
  return undefined;
}

function extractMaxPrice(message: string) {
  const match = message.match(/(?:under|below|max)\s*[₹rs.\s]*([0-9]{3,6})/i);
  return match ? Number(match[1]) : undefined;
}

function buildSearchQuery(message: string) {
  const lower = message.toLowerCase();
  const cleaned = lower
    .replace(/₹\s*[0-9]{3,6}/g, " ")
    .replace(/(?:under|below|max)\s*[0-9]{3,6}/g, " ")
    .replace(/\b(best|this weekend|weekend|near|around|available|availability|next saturday|track my booking|my booking|show|find|compare|options|option|please|for|the|one|is|are|of|in)\b/g, " ")
    .replace(/\b(trek|treks|trekking)\b/g, " ")
    .replace(/\b(camp|camping)\b/g, " ")
    .replace(/\b(water sports|water|scuba|snorkeling|snorkelling|kayaking)\b/g, " ")
    .replace(/\b(wildlife|safari)\b/g, " ")
    .replace(/\b(cycling|cycling tours|ride|rides)\b/g, " ")
    .replace(/\b(heritage|fort walk|fort walks)\b/g, " ")
    .replace(/\b(lonavala|bhandardara|kaas plateau|harihar fort|tarkarli|matheran|rajmachi|igatpuri|karjat|malshej ghat)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length >= 3 ? cleaned : undefined;
}

function extractDateIntent(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("next saturday")) {
    const date = new Date();
    const offset = (6 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
  return undefined;
}

async function searchListingsTool(message: string) {
  const destination = extractDestinationSlug(message) ?? undefined;
  const category = extractCategorySlug(message);
  const difficulty = extractDifficulty(message);
  const maxPrice = extractMaxPrice(message);

  const hasStructuredFilter = Boolean(
    destination || category || difficulty || maxPrice,
  );

  const listings = await getListings({
    query: hasStructuredFilter ? undefined : buildSearchQuery(message),
    destination,
    category,
    difficulty,
    maxPrice,
  });

  return listings.slice(0, 5).map((listing) => ({
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.discountPrice ?? listing.pricePerPerson,
    durationHours: listing.durationHours,
    durationDays: listing.durationDays,
    rating: listing.avgRating,
    link: `/listings/${listing.id}`,
    destination: listing.destination.name,
    destinationSlug: listing.destination.slug,
    category: listing.category.name,
  }));
}

async function getListingDetailsTool(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      destination: true,
      category: true,
      operator: true,
      itineraryDays: { orderBy: { dayNumber: "asc" } },
    },
  });
}

async function checkAvailabilityTool(listingId: string, date?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      availabilitySlots: {
        where: {
          isActive: true,
          ...(date
            ? {
                date: {
                  gte: new Date(date),
                  lte: new Date(`${date.slice(0, 10)}T23:59:59.999Z`),
                },
              }
            : {
                date: { gte: new Date() },
              }),
        },
        orderBy: { date: "asc" },
        take: 5,
      },
    },
  });

  return {
    listingId,
    listingTitle: listing?.title,
    slots: (listing?.availabilitySlots ?? []).map((slot) => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      openSpots: slot.capacity - slot.bookedCount,
      isAvailable: slot.capacity - slot.bookedCount > 0,
    })),
  };
}

async function getUserBookingsTool(userId: string) {
  return getUserBookings(userId);
}

function inferTool(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("available") ||
    lower.includes("availability") ||
    lower.includes("next saturday")
  ) {
    return "availability";
  }

  if (
    lower.includes("my booking") ||
    lower.includes("track my booking") ||
    lower.includes("next trip") ||
    lower.includes("cancel")
  ) {
    return "userBookings";
  }

  if (
    lower.includes("destination") ||
    lower.includes("best season") ||
    lower.includes("weather") ||
    lower.includes("monsoon")
  ) {
    return "destination";
  }

  if (
    lower.includes("details") ||
    lower.includes("itinerary") ||
    lower.includes("operator")
  ) {
    return "listingDetails";
  }

  return "search";
}

function extractListingId(message: string) {
  const match = message.match(/listing\s+([a-z0-9]+)/i);
  return match?.[1] ?? null;
}

function buildListingCards(results: Awaited<ReturnType<typeof searchListingsTool>>): ChatCard[] {
  return results.map((item) => ({
    type: "listing",
    title: item.title,
    subtitle: `${item.destination} · ${item.category}`,
    href: item.link,
    badges: [
      formatCurrency(item.price),
      item.durationDays ? `${item.durationDays} day${item.durationDays > 1 ? "s" : ""}` : `${item.durationHours} hrs`,
      `⭐ ${item.rating.toFixed(1)}`,
    ],
  }));
}

function buildBookingCards(bookings: Awaited<ReturnType<typeof getUserBookingsTool>>["upcoming"]): ChatCard[] {
  return bookings.slice(0, 3).map((booking) => ({
    type: "booking",
    title: booking.listing.title,
    subtitle: `${booking.bookingReference} · ${booking.status}`,
    href: `/booking/confirmation/${booking.id}`,
    badges: [formatTripDate(booking.tripDate), formatCurrency(booking.totalAmount)],
  }));
}

function createSearchReply(
  results: Awaited<ReturnType<typeof searchListingsTool>>,
): { message: string; cards: ChatCard[] } {
  if (!results.length) {
    return {
      message:
        "I couldn’t find a strong match right now. Try a destination, activity type, or budget like ‘Lonavala trek under ₹1500’.",
      cards: [] as ChatCard[],
    };
  }

  const first = results[0];
  return {
    message: `I found ${results.length} good option${results.length > 1 ? "s" : ""}. ${first.title} in ${first.destination} starts from ${formatCurrency(first.price)}.`,
    cards: buildListingCards(results),
  };
}

function createAvailabilityReply(
  result: Awaited<ReturnType<typeof checkAvailabilityTool>>,
): { message: string; cards: ChatCard[] } {
  if (!result.listingTitle) {
    return {
      message: "I couldn’t find that listing’s live availability just now.",
      cards: [] as ChatCard[],
    };
  }

  const availableSlot = result.slots.find((slot) => slot.isAvailable);
  if (!availableSlot) {
    return {
      message: `${result.listingTitle} does not have an open slot in the dates I checked. Please try another date or listing.`,
      cards: [],
    };
  }

  return {
    message: `${result.listingTitle} is available on ${formatTripDate(availableSlot.date)} at ${availableSlot.startTime}, with ${availableSlot.openSpots} spot${availableSlot.openSpots > 1 ? "s" : ""} left.`,
    cards: [
      {
        type: "listing",
        title: result.listingTitle,
        subtitle: "Live availability",
        href: `/booking/${result.listingId}`,
        badges: [formatTripDate(availableSlot.date), `${availableSlot.startTime}`, `${availableSlot.openSpots} spots left`],
      },
    ],
  };
}

function createDestinationReply(
  result: Awaited<ReturnType<typeof getDestinationInfo>>,
): { message: string; cards: ChatCard[] } {
  if (!result) {
    return {
      message: "I can share destination guidance once you mention a place like Lonavala, Rajmachi, Tarkarli, or Harihar Fort.",
      cards: [] as ChatCard[],
    };
  }

  return {
    message: `${result.name} is best in ${result.bestSeason}. It’s in ${result.region}, ${result.district}, and is usually a good fit for ${result.difficultyTags.join(", ")} adventures.`,
    cards: [
      {
        type: "listing",
        title: result.name,
        subtitle: `${result.region} · ${result.district}`,
        href: `/destinations/${result.slug}`,
        badges: [`Best: ${result.bestSeason}`, ...result.difficultyTags.slice(0, 2)],
      },
    ],
  };
}

function createListingDetailsReply(
  result: Awaited<ReturnType<typeof getListingDetailsTool>>,
): { message: string; cards: ChatCard[] } {
  if (!result) {
    return {
      message: "I couldn’t pull those listing details yet. Try asking with the listing name instead.",
      cards: [] as ChatCard[],
    };
  }

  return {
    message: `${result.title} is a ${result.category.name.toLowerCase()} experience in ${result.destination.name}. It starts from ${formatCurrency(result.discountPrice ?? result.pricePerPerson)} and is run by ${result.operator.businessName}.`,
    cards: [
      {
        type: "listing",
        title: result.title,
        subtitle: `${result.destination.name} · ${result.category.name}`,
        href: `/listings/${result.id}`,
        badges: [
          formatCurrency(result.discountPrice ?? result.pricePerPerson),
          result.durationDays ? `${result.durationDays} day${result.durationDays > 1 ? "s" : ""}` : `${result.durationHours} hrs`,
          result.difficultyLevel,
        ],
      },
    ],
  };
}

function createUserBookingsReply(
  result:
    | Awaited<ReturnType<typeof getUserBookingsTool>>
    | "User is not logged in.",
): { message: string; cards: ChatCard[] } {
  if (result === "User is not logged in.") {
    return {
      message: "Please sign in first, and I can track your bookings, next trip date, and cancellation options.",
      cards: [] as ChatCard[],
    };
  }

  if (!result.upcoming.length && !result.past.length && !result.cancelled.length) {
    return {
      message: "You don’t have any bookings yet. I can help you find a trek, camp, or coastal activity next.",
      cards: [] as ChatCard[],
    };
  }

  const nextTrip = result.upcoming[0];
  if (nextTrip) {
    return {
      message: `Your next trip is ${nextTrip.listing.title} on ${formatTripDate(nextTrip.tripDate)}. Its current status is ${nextTrip.status}.`,
      cards: buildBookingCards(result.upcoming),
    };
  }

  return {
    message: `You don’t have an upcoming trip right now, but I found ${result.past.length} past and ${result.cancelled.length} cancelled booking${result.past.length + result.cancelled.length === 1 ? "" : "s"}.`,
    cards: buildBookingCards([...result.past, ...result.cancelled]),
  };
}

export async function answerChatMessage(params: {
  sessionId: string;
  userId?: string;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  enforceRateLimit(params.sessionId);

  await prisma.chatMessage.create({
    data: {
      sessionId: params.sessionId,
      userId: params.userId,
      role: "USER",
      content: params.message,
    },
  });

  const tool = inferTool(params.message);
  let toolResult: unknown;

  if (tool === "search") {
    toolResult = await searchListingsTool(params.message);
  }

  if (tool === "listingDetails") {
    const listingId = extractListingId(params.message);
    if (listingId) {
      toolResult = await getListingDetailsTool(listingId);
    } else {
      const searchResults = await searchListingsTool(params.message);
      toolResult = searchResults[0]
        ? await getListingDetailsTool(searchResults[0].id)
        : null;
    }
  }

  if (tool === "availability") {
    const searchResults = await searchListingsTool(params.message);
    const targetListing = searchResults[0];
    toolResult = targetListing
      ? await checkAvailabilityTool(targetListing.id, extractDateIntent(params.message))
      : null;
  }

  if (tool === "destination") {
    const destinationSlug = extractDestinationSlug(params.message);
    toolResult = destinationSlug ? await getDestinationInfo(destinationSlug) : null;
  }

  if (tool === "userBookings") {
    toolResult = params.userId
      ? await getUserBookingsTool(params.userId)
      : "User is not logged in.";
  }

  let response: { message: string; cards: ChatCard[] } = {
    message: "I couldn’t find enough information for that request.",
    cards: [],
  };

  if (tool === "search") {
    response = createSearchReply(toolResult as Awaited<ReturnType<typeof searchListingsTool>>);
  }

  if (tool === "listingDetails") {
    response = createListingDetailsReply(toolResult as Awaited<ReturnType<typeof getListingDetailsTool>>);
  }

  if (tool === "availability") {
    response = createAvailabilityReply(toolResult as Awaited<ReturnType<typeof checkAvailabilityTool>>);
  }

  if (tool === "destination") {
    response = createDestinationReply(toolResult as Awaited<ReturnType<typeof getDestinationInfo>>);
  }

  if (tool === "userBookings") {
    response = createUserBookingsReply(toolResult as Awaited<ReturnType<typeof getUserBookingsTool>> | "User is not logged in.");
  }

  const assistantMessage = await prisma.chatMessage.create({
    data: {
      sessionId: params.sessionId,
      userId: params.userId,
      role: "ASSISTANT",
      content: response.message,
    },
  });

  return {
    message: assistantMessage.content,
    tool,
    toolResult,
    cards: response.cards,
  };
}
