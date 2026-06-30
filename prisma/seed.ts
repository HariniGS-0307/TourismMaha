import {
  BookingStatus,
  DifficultyLevel,
  ListingStatus,
  PaymentStatus,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

const imageBank = {
  trek: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  camp: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  water:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  fort: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
  valley:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
};

async function upsertUser(params: {
  email: string;
  name: string;
  role: UserRole;
  image?: string;
}) {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  return prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name,
      role: params.role,
      image: params.image,
      passwordHash,
    },
    create: {
      email: params.email,
      name: params.name,
      role: params.role,
      image: params.image,
      passwordHash,
    },
  });
}

async function main() {
  const [admin, operatorUser1, operatorUser2, operatorUser3, demoUser] =
    await Promise.all([
      upsertUser({
        email: "admin@maharashtra-adventures.test",
        name: "Platform Admin",
        role: UserRole.ADMIN,
      }),
      upsertUser({
        email: "operator1@maharashtra-adventures.test",
        name: "Aditi Guide",
        role: UserRole.OPERATOR,
      }),
      upsertUser({
        email: "operator2@maharashtra-adventures.test",
        name: "Rohan Coast",
        role: UserRole.OPERATOR,
      }),
      upsertUser({
        email: "operator3@maharashtra-adventures.test",
        name: "Neha Trails",
        role: UserRole.OPERATOR,
      }),
      upsertUser({
        email: "user@maharashtra-adventures.test",
        name: "Demo User",
        role: UserRole.USER,
      }),
    ]);

  const operators = await Promise.all([
    prisma.operatorProfile.upsert({
      where: { userId: operatorUser1.id },
      update: {
        businessName: "Pune Peaks Adventures",
        description:
          "Trek leaders for Sahyadri monsoon hikes, fort trails, and beginner-friendly camping.",
        logoUrl: imageBank.trek,
        phone: "+91 9876543210",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.8,
        totalBookings: 184,
      },
      create: {
        userId: operatorUser1.id,
        businessName: "Pune Peaks Adventures",
        description:
          "Trek leaders for Sahyadri monsoon hikes, fort trails, and beginner-friendly camping.",
        logoUrl: imageBank.trek,
        phone: "+91 9876543210",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.8,
        totalBookings: 184,
      },
    }),
    prisma.operatorProfile.upsert({
      where: { userId: operatorUser2.id },
      update: {
        businessName: "Konkan Blue Escapes",
        description:
          "Coastal activity specialists with scuba, snorkeling, kayaking, and island camping.",
        logoUrl: imageBank.water,
        phone: "+91 9811122233",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.7,
        totalBookings: 126,
      },
      create: {
        userId: operatorUser2.id,
        businessName: "Konkan Blue Escapes",
        description:
          "Coastal activity specialists with scuba, snorkeling, kayaking, and island camping.",
        logoUrl: imageBank.water,
        phone: "+91 9811122233",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.7,
        totalBookings: 126,
      },
    }),
    prisma.operatorProfile.upsert({
      where: { userId: operatorUser3.id },
      update: {
        businessName: "Maha Heritage Riders",
        description:
          "Curated cycling tours, heritage walks, and premium weekend escapes across Maharashtra.",
        logoUrl: imageBank.fort,
        phone: "+91 9922334455",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.6,
        totalBookings: 94,
      },
      create: {
        userId: operatorUser3.id,
        businessName: "Maha Heritage Riders",
        description:
          "Curated cycling tours, heritage walks, and premium weekend escapes across Maharashtra.",
        logoUrl: imageBank.fort,
        phone: "+91 9922334455",
        isVerified: true,
        verificationDocs: [
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ],
        rating: 4.6,
        totalBookings: 94,
      },
    }),
  ]);

  const categoriesData = [
    {
      name: "Trekking",
      slug: "trekking",
      icon: "mountain",
      description: "Summit trails, fort hikes, and guided monsoon treks.",
    },
    {
      name: "Camping",
      slug: "camping",
      icon: "tent",
      description: "Weekend escapes under the stars with meals and guides.",
    },
    {
      name: "Water Sports",
      slug: "water-sports",
      icon: "waves",
      description: "Kayaking, snorkeling, scuba diving, and coastal fun.",
    },
    {
      name: "Wildlife Safari",
      slug: "wildlife-safari",
      icon: "trees",
      description:
        "Nature trails, safaris, birding, and conservation experiences.",
    },
    {
      name: "Cycling",
      slug: "cycling",
      icon: "bike",
      description: "Road and trail cycling routes with support teams.",
    },
    {
      name: "Heritage Trails",
      slug: "heritage-trails",
      icon: "castle",
      description: "Fort walks, culture circuits, and historic exploration.",
    },
  ];

  for (const category of categoriesData) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const destinationsData = [
    {
      name: "Lonavala",
      slug: "lonavala",
      district: "Pune",
      region: "Western Ghats",
      description:
        "Maharashtra's monsoon favorite with misty valleys, easy trails, and waterfall points.",
      heroImageUrl: imageBank.trek,
      latitude: 18.7483,
      longitude: 73.4074,
      bestSeason: "June to February",
      difficultyTags: ["easy", "moderate"],
    },
    {
      name: "Bhandardara",
      slug: "bhandardara",
      district: "Ahmednagar",
      region: "Western Ghats",
      description:
        "Lakeside camping, firefly season, and scenic access to Ratangad and Sandhan Valley.",
      heroImageUrl: imageBank.camp,
      latitude: 19.5421,
      longitude: 73.7494,
      bestSeason: "July to February",
      difficultyTags: ["easy", "moderate"],
    },
    {
      name: "Kaas Plateau",
      slug: "kaas-plateau",
      district: "Satara",
      region: "Western Ghats",
      description:
        "UNESCO flower plateau with seasonal blooms, photography trails, and cool weather.",
      heroImageUrl: imageBank.valley,
      latitude: 17.7208,
      longitude: 73.8214,
      bestSeason: "August to October",
      difficultyTags: ["easy"],
    },
    {
      name: "Harihar Fort",
      slug: "harihar-fort",
      district: "Nashik",
      region: "Western Ghats",
      description:
        "A thrilling fort climb known for its iconic rock-cut steps and expansive valley views.",
      heroImageUrl: imageBank.fort,
      latitude: 20.2045,
      longitude: 73.6541,
      bestSeason: "October to February",
      difficultyTags: ["moderate", "hard"],
    },
    {
      name: "Tarkarli",
      slug: "tarkarli",
      district: "Sindhudurg",
      region: "Konkan Coast",
      description:
        "Clear-water beaches for scuba diving, snorkeling, parasailing, and houseboat stays.",
      heroImageUrl: imageBank.water,
      latitude: 16.0418,
      longitude: 73.4875,
      bestSeason: "October to May",
      difficultyTags: ["easy"],
    },
    {
      name: "Matheran",
      slug: "matheran",
      district: "Raigad",
      region: "Western Ghats",
      description:
        "A slow-travel hill station with forest trails, viewpoints, and no motor vehicles.",
      heroImageUrl: imageBank.valley,
      latitude: 18.9861,
      longitude: 73.2679,
      bestSeason: "October to March",
      difficultyTags: ["easy"],
    },
    {
      name: "Rajmachi",
      slug: "rajmachi",
      district: "Pune",
      region: "Western Ghats",
      description:
        "Classic overnight fort trek with village camping, fireflies in summer, and lush monsoon routes.",
      heroImageUrl: imageBank.trek,
      latitude: 18.8966,
      longitude: 73.3906,
      bestSeason: "June to February",
      difficultyTags: ["moderate"],
    },
    {
      name: "Igatpuri",
      slug: "igatpuri",
      district: "Nashik",
      region: "Western Ghats",
      description:
        "A mountain town with ridgelines, waterfalls, and easy highway access from Mumbai and Nashik.",
      heroImageUrl: imageBank.camp,
      latitude: 19.6954,
      longitude: 73.5626,
      bestSeason: "July to February",
      difficultyTags: ["easy", "moderate"],
    },
    {
      name: "Karjat",
      slug: "karjat",
      district: "Raigad",
      region: "Western Ghats",
      description:
        "Riverside stays, rapids, fort approaches, and beginner-friendly adventure packages.",
      heroImageUrl: imageBank.camp,
      latitude: 18.9107,
      longitude: 73.3235,
      bestSeason: "June to February",
      difficultyTags: ["easy", "moderate"],
    },
    {
      name: "Malshej Ghat",
      slug: "malshej-ghat",
      district: "Pune",
      region: "Western Ghats",
      description:
        "Misty passes, flamingo season, and dramatic monsoon roads for nature lovers.",
      heroImageUrl: imageBank.valley,
      latitude: 19.3092,
      longitude: 73.7766,
      bestSeason: "July to January",
      difficultyTags: ["easy", "moderate"],
    },
  ];

  for (const destination of destinationsData) {
    await prisma.destination.upsert({
      where: { slug: destination.slug },
      update: destination,
      create: destination,
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((item) => [item.slug, item.id]),
  );
  const destinationMap = Object.fromEntries(
    (await prisma.destination.findMany()).map((item) => [item.slug, item.id]),
  );
  const operatorMap = {
    pune: operators[0].id,
    konkan: operators[1].id,
    heritage: operators[2].id,
  };

  const listingsData = [
    {
      title: "Lonavala Waterfall Trek",
      slug: "lonavala-waterfall-trek",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.trekking,
      destinationId: destinationMap.lonavala,
      shortDescription:
        "Beginner-friendly monsoon trek with waterfall views and breakfast.",
      fullDescription:
        "A guided half-day trek through Lonavala's lush monsoon trails with local breakfast, route support, and scenic viewpoints.",
      pricePerPerson: 1499,
      discountPrice: 1199,
      durationHours: 6,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 20,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Guide", "Breakfast", "First-aid support", "Trail permits"],
      exclusions: ["Transport to base village", "Personal expenses"],
      thingsToCarry: [
        "Trekking shoes",
        "Poncho",
        "Water bottle",
        "Small daypack",
      ],
      images: [imageBank.trek, imageBank.valley],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.7,
    },
    {
      title: "Rajmachi Overnight Camping Trek",
      slug: "rajmachi-overnight-camping-trek",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.camping,
      destinationId: destinationMap.rajmachi,
      shortDescription:
        "Overnight village camping with fort exploration and bonfire.",
      fullDescription:
        "Trek to Rajmachi, camp near the village, enjoy local dinner, and catch sunrise from the fort the next morning.",
      pricePerPerson: 2299,
      discountPrice: 1999,
      durationHours: 18,
      durationDays: 2,
      groupSizeMin: 4,
      groupSizeMax: 25,
      difficultyLevel: DifficultyLevel.MODERATE,
      inclusions: [
        "Guide",
        "Dinner",
        "Breakfast",
        "Tent stay",
        "Local permissions",
      ],
      exclusions: ["Travel to Lonavala", "Sleeping bag liner"],
      thingsToCarry: ["Torch", "Warm layer", "Water bottle", "Extra socks"],
      images: [imageBank.camp, imageBank.fort],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.8,
    },
    {
      title: "Bhandardara Lakeside Camping",
      slug: "bhandardara-lakeside-camping",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.camping,
      destinationId: destinationMap.bhandardara,
      shortDescription:
        "Relaxed lake-view camping with barbecue and stargazing.",
      fullDescription:
        "A premium campsite by the lake with evening snacks, barbecue, dinner, and sunrise views.",
      pricePerPerson: 1899,
      discountPrice: 1699,
      durationHours: 20,
      durationDays: 2,
      groupSizeMin: 2,
      groupSizeMax: 30,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Camp stay", "Dinner", "Breakfast", "Bonfire", "Washrooms"],
      exclusions: ["Travel", "Insurance"],
      thingsToCarry: ["Jacket", "Power bank", "Personal medicines"],
      images: [imageBank.camp, imageBank.valley],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.5,
    },
    {
      title: "Harihar Fort Summit Trek",
      slug: "harihar-fort-summit-trek",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.trekking,
      destinationId: destinationMap["harihar-fort"],
      shortDescription:
        "Adventure-packed climb to one of Maharashtra's most iconic forts.",
      fullDescription:
        "Climb the famed rock-cut steps of Harihar Fort with trek leaders, breakfast, and transport from Nashik.",
      pricePerPerson: 1799,
      discountPrice: 1499,
      durationHours: 10,
      durationDays: 1,
      groupSizeMin: 4,
      groupSizeMax: 18,
      difficultyLevel: DifficultyLevel.HARD,
      inclusions: ["Guide", "Breakfast", "Local transport", "Safety briefing"],
      exclusions: ["Dinner", "Personal gear"],
      thingsToCarry: ["Grip shoes", "Electrolytes", "Cap", "Windcheater"],
      images: [imageBank.fort, imageBank.trek],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.9,
    },
    {
      title: "Tarkarli Scuba Discovery Dive",
      slug: "tarkarli-scuba-discovery-dive",
      operatorId: operatorMap.konkan,
      categoryId: categoryMap["water-sports"],
      destinationId: destinationMap.tarkarli,
      shortDescription:
        "Beginner-friendly scuba experience with underwater photos.",
      fullDescription:
        "Includes pool briefing, one assisted sea dive, safety equipment, and digital media from the dive.",
      pricePerPerson: 3499,
      discountPrice: 2999,
      durationHours: 4,
      durationDays: 1,
      groupSizeMin: 1,
      groupSizeMax: 10,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Instructor", "Equipment", "Boat ride", "Photos/video"],
      exclusions: ["Meals", "Pickup from hotel"],
      thingsToCarry: ["Towel", "Extra clothes", "Sunscreen"],
      images: [imageBank.water, imageBank.valley],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.8,
    },
    {
      title: "Tarkarli Kayak and Snorkel Combo",
      slug: "tarkarli-kayak-snorkel-combo",
      operatorId: operatorMap.konkan,
      categoryId: categoryMap["water-sports"],
      destinationId: destinationMap.tarkarli,
      shortDescription:
        "A coastal combo for first-time water adventure seekers.",
      fullDescription:
        "Morning backwater kayaking followed by a guided shallow-water snorkel session on the coast.",
      pricePerPerson: 2199,
      discountPrice: 1899,
      durationHours: 5,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 12,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Kayak", "Life jacket", "Snorkel kit", "Guide"],
      exclusions: ["Travel", "Meals"],
      thingsToCarry: ["Waterproof pouch", "Towel", "Flip-flops"],
      images: [imageBank.water, imageBank.camp],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.6,
    },
    {
      title: "Matheran Sunrise Forest Walk",
      slug: "matheran-sunrise-forest-walk",
      operatorId: operatorMap.heritage,
      categoryId: categoryMap["heritage-trails"],
      destinationId: destinationMap.matheran,
      shortDescription:
        "Vehicle-free morning trail through Matheran's red-soil pathways.",
      fullDescription:
        "A leisurely guided walk covering panoramic viewpoints, local history, and a sunrise breakfast stop.",
      pricePerPerson: 999,
      discountPrice: 799,
      durationHours: 3,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 15,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Guide", "Tea and snacks", "Entry support"],
      exclusions: ["Toy train tickets", "Lunch"],
      thingsToCarry: ["Cap", "Reusable bottle", "Walking shoes"],
      images: [imageBank.valley, imageBank.trek],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.3,
    },
    {
      title: "Igatpuri Ridge Trek and Waterfall Picnic",
      slug: "igatpuri-ridge-trek-waterfall-picnic",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.trekking,
      destinationId: destinationMap.igatpuri,
      shortDescription:
        "Easy-moderate trail with valley views and packed meals.",
      fullDescription:
        "Ideal for weekend travellers looking for a relaxed ridge hike with monsoon greenery and a waterfall stop.",
      pricePerPerson: 1399,
      discountPrice: 1199,
      durationHours: 7,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 20,
      difficultyLevel: DifficultyLevel.MODERATE,
      inclusions: ["Guide", "Breakfast", "Packed lunch"],
      exclusions: ["Travel to start point"],
      thingsToCarry: ["Non-slip shoes", "Poncho", "Small towel"],
      images: [imageBank.trek, imageBank.valley],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.4,
    },
    {
      title: "Karjat River Rafting Escape",
      slug: "karjat-river-rafting-escape",
      operatorId: operatorMap.konkan,
      categoryId: categoryMap["water-sports"],
      destinationId: destinationMap.karjat,
      shortDescription:
        "Seasonal rafting experience with trained marshals and refreshments.",
      fullDescription:
        "Short rapids section for beginners and small groups with safety gear and changing rooms.",
      pricePerPerson: 1699,
      discountPrice: 1499,
      durationHours: 3,
      durationDays: 1,
      groupSizeMin: 4,
      groupSizeMax: 20,
      difficultyLevel: DifficultyLevel.MODERATE,
      inclusions: ["Raft", "Helmet", "Life jacket", "Guide"],
      exclusions: ["Transport", "Waterproof footwear"],
      thingsToCarry: ["Quick-dry clothes", "Waterproof pouch"],
      images: [imageBank.water, imageBank.camp],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.5,
    },
    {
      title: "Malshej Ghat Flamingo Trail",
      slug: "malshej-ghat-flamingo-trail",
      operatorId: operatorMap.heritage,
      categoryId: categoryMap["wildlife-safari"],
      destinationId: destinationMap["malshej-ghat"],
      shortDescription:
        "Monsoon nature trail with birding support and local breakfast.",
      fullDescription:
        "A guided nature walk focused on seasonal birding, waterfalls, and geology around Malshej Ghat.",
      pricePerPerson: 1299,
      discountPrice: 1099,
      durationHours: 5,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 16,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Naturalist guide", "Breakfast", "Binocular support"],
      exclusions: ["Travel", "Rainwear"],
      thingsToCarry: ["Cap", "Notebook", "Rain jacket"],
      images: [imageBank.valley, imageBank.camp],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.2,
    },
    {
      title: "Kaas Plateau Flower Trail",
      slug: "kaas-plateau-flower-trail",
      operatorId: operatorMap.heritage,
      categoryId: categoryMap["heritage-trails"],
      destinationId: destinationMap["kaas-plateau"],
      shortDescription:
        "Slow-paced interpretive walk through Maharashtra's flower valley.",
      fullDescription:
        "A guided exploration of endemic blooms with photography stops, local snacks, and ecological stories.",
      pricePerPerson: 1599,
      discountPrice: 1399,
      durationHours: 6,
      durationDays: 1,
      groupSizeMin: 2,
      groupSizeMax: 14,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Naturalist", "Entry assistance", "Snacks"],
      exclusions: ["Transport", "Professional camera fees"],
      thingsToCarry: ["Walking shoes", "Rain cover", "Power bank"],
      images: [imageBank.valley, imageBank.trek],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.7,
    },
    {
      title: "Lonavala Beginner Camping Night",
      slug: "lonavala-beginner-camping-night",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.camping,
      destinationId: destinationMap.lonavala,
      shortDescription:
        "Low-effort overnight camp for first-timers close to Pune and Mumbai.",
      fullDescription:
        "An easy camping package with music, dinner, tents, and a short sunrise walk the next morning.",
      pricePerPerson: 1599,
      discountPrice: 1299,
      durationHours: 16,
      durationDays: 2,
      groupSizeMin: 2,
      groupSizeMax: 40,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Tent stay", "Dinner", "Breakfast", "Bonfire"],
      exclusions: ["Travel", "Bottled water"],
      thingsToCarry: ["Jacket", "Torch", "Reusable bottle"],
      images: [imageBank.camp, imageBank.trek],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.1,
    },
    {
      title: "Karjat Countryside Cycling Loop",
      slug: "karjat-countryside-cycling-loop",
      operatorId: operatorMap.heritage,
      categoryId: categoryMap.cycling,
      destinationId: destinationMap.karjat,
      shortDescription:
        "Supported early-morning cycling through villages and paddy fields.",
      fullDescription:
        "Includes hybrid cycle rental, refreshments, route marshal, and a riverside breakfast stop.",
      pricePerPerson: 1199,
      discountPrice: 999,
      durationHours: 4,
      durationDays: 1,
      groupSizeMin: 4,
      groupSizeMax: 20,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Cycle", "Helmet", "Refreshments", "Marshal"],
      exclusions: ["Travel to meeting point"],
      thingsToCarry: ["Athleisure wear", "Water bottle", "Sunglasses"],
      images: [imageBank.valley, imageBank.camp],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.4,
    },
    {
      title: "Bhandardara Fireflies Special Camp",
      slug: "bhandardara-fireflies-special-camp",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.camping,
      destinationId: destinationMap.bhandardara,
      shortDescription:
        "Seasonal early-summer campsite timed for firefly sightings.",
      fullDescription:
        "A premium seasonal experience with dinner, guided night walk, and tranquil campsite ambience.",
      pricePerPerson: 2599,
      discountPrice: 2299,
      durationHours: 18,
      durationDays: 2,
      groupSizeMin: 2,
      groupSizeMax: 24,
      difficultyLevel: DifficultyLevel.EASY,
      inclusions: ["Tent stay", "Dinner", "Breakfast", "Night walk guide"],
      exclusions: ["Travel", "Personal torch"],
      thingsToCarry: ["Light jacket", "Mosquito repellent", "Torch"],
      images: [imageBank.camp, imageBank.valley],
      status: ListingStatus.PUBLISHED,
      avgRating: 4.9,
    },
    {
      title: "Igatpuri Premium Weekend Trek Camp",
      slug: "igatpuri-premium-weekend-trek-camp",
      operatorId: operatorMap.pune,
      categoryId: categoryMap.camping,
      destinationId: destinationMap.igatpuri,
      shortDescription:
        "Comfort camp with a guided trek and valley sunset deck.",
      fullDescription:
        "Stay in bell tents, enjoy guided exploration, hot meals, and a relaxed premium camping weekend.",
      pricePerPerson: 2999,
      discountPrice: 2699,
      durationHours: 22,
      durationDays: 2,
      groupSizeMin: 2,
      groupSizeMax: 18,
      difficultyLevel: DifficultyLevel.MODERATE,
      inclusions: ["Premium tent", "All meals", "Guide", "Camp activities"],
      exclusions: ["Pickup from Mumbai"],
      thingsToCarry: ["Trek shoes", "Layered clothing", "Flashlight"],
      images: [imageBank.camp, imageBank.trek],
      status: ListingStatus.DRAFT,
      avgRating: 0,
    },
  ];

  for (const listing of listingsData) {
    const savedListing = await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: listing,
      create: listing,
    });

    await prisma.itineraryDay.deleteMany({
      where: { listingId: savedListing.id },
    });
    const itineraryDays =
      listing.durationDays && listing.durationDays > 1
        ? [
            {
              listingId: savedListing.id,
              dayNumber: 1,
              title: "Arrival and activity briefing",
              description:
                "Check-in, meet the guide team, safety briefing, and first activity block.",
              activities: ["Check-in", "Orientation", "Primary activity"],
            },
            {
              listingId: savedListing.id,
              dayNumber: 2,
              title: "Sunrise experience and departure",
              description:
                "Early-morning activity, breakfast, and return or dispersal.",
              activities: ["Sunrise session", "Breakfast", "Checkout"],
            },
          ]
        : [
            {
              listingId: savedListing.id,
              dayNumber: 1,
              title: "Main experience",
              description:
                "Meet-up, briefing, activity experience, meal stop, and wrap-up.",
              activities: ["Meet-up", "Briefing", "Experience", "Wrap-up"],
            },
          ];

    await prisma.itineraryDay.createMany({ data: itineraryDays });

    await prisma.availabilitySlot.deleteMany({
      where: { listingId: savedListing.id },
    });
    await prisma.availabilitySlot.createMany({
      data: Array.from({ length: 6 }, (_, index) => {
        const date = addDays(startOfDay(new Date()), index + 2);
        return {
          listingId: savedListing.id,
          date,
          startTime:
            listing.durationDays && listing.durationDays > 1
              ? "17:00"
              : "06:00",
          capacity: savedListing.groupSizeMax,
          bookedCount:
            index === 0 ? Math.max(savedListing.groupSizeMin - 1, 0) : 0,
          isActive: savedListing.status === ListingStatus.PUBLISHED,
        };
      }),
    });
  }

  const welcomeCoupon = await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {
      discountPercent: 10,
      validFrom: startOfDay(new Date()),
      validTo: addDays(startOfDay(new Date()), 180),
      maxUses: 100,
      usedCount: 0,
    },
    create: {
      code: "WELCOME10",
      discountPercent: 10,
      validFrom: startOfDay(new Date()),
      validTo: addDays(startOfDay(new Date()), 180),
      maxUses: 100,
      usedCount: 0,
    },
  });

  const sampleListing = await prisma.listing.findUniqueOrThrow({
    where: { slug: "lonavala-waterfall-trek" },
    include: { availabilitySlots: { orderBy: { date: "asc" }, take: 1 } },
  });

  const booking = await prisma.booking.upsert({
    where: { bookingReference: "MAHA-BOOK-1001" },
    update: {
      userId: demoUser.id,
      listingId: sampleListing.id,
      slotId: sampleListing.availabilitySlots[0].id,
      numberOfPeople: 2,
      totalAmount: 2398,
      discountAmount: 0,
      status: BookingStatus.CONFIRMED,
      tripDate: sampleListing.availabilitySlots[0].date,
      couponId: welcomeCoupon.id,
    },
    create: {
      userId: demoUser.id,
      listingId: sampleListing.id,
      slotId: sampleListing.availabilitySlots[0].id,
      numberOfPeople: 2,
      totalAmount: 2398,
      discountAmount: 0,
      status: BookingStatus.CONFIRMED,
      bookingReference: "MAHA-BOOK-1001",
      tripDate: sampleListing.availabilitySlots[0].date,
      couponId: welcomeCoupon.id,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      razorpayOrderId: "order_seed_1001",
      razorpayPaymentId: "pay_seed_1001",
      amount: 2398,
      currency: "INR",
      status: PaymentStatus.PAID,
    },
    create: {
      bookingId: booking.id,
      razorpayOrderId: "order_seed_1001",
      razorpayPaymentId: "pay_seed_1001",
      amount: 2398,
      currency: "INR",
      status: PaymentStatus.PAID,
    },
  });

  await prisma.review.upsert({
    where: { bookingId: booking.id },
    update: {
      userId: demoUser.id,
      listingId: sampleListing.id,
      rating: 5,
      comment: "Great first trek experience. Well-paced and beginner friendly.",
      images: [],
    },
    create: {
      bookingId: booking.id,
      userId: demoUser.id,
      listingId: sampleListing.id,
      rating: 5,
      comment: "Great first trek experience. Well-paced and beginner friendly.",
      images: [],
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "booking",
        title: "Booking confirmed",
        message: "Your Lonavala Waterfall Trek is confirmed.",
      },
      {
        userId: operatorUser1.id,
        type: "operator",
        title: "New booking received",
        message: "You have a new booking for Lonavala Waterfall Trek.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: "seed-session",
        userId: demoUser.id,
        role: "USER",
        content: "What are the best treks near Pune this weekend?",
      },
      {
        sessionId: "seed-session",
        userId: demoUser.id,
        role: "ASSISTANT",
        content:
          "You could try the Lonavala Waterfall Trek or Rajmachi Overnight Camping Trek.",
      },
    ],
    skipDuplicates: true,
  });

  const allListings = await prisma.listing.findMany({
    include: { reviews: true, bookings: true },
  });

  for (const item of allListings) {
    const avgRating = item.reviews.length
      ? item.reviews.reduce((sum, review) => sum + review.rating, 0) /
        item.reviews.length
      : item.avgRating;

    await prisma.listing.update({
      where: { id: item.id },
      data: { avgRating },
    });
  }

  for (const operator of operators) {
    const operatorListings = await prisma.listing.findMany({
      where: { operatorId: operator.id },
      include: { reviews: true, bookings: true },
    });

    const bookingCount = operatorListings.reduce(
      (sum, item) => sum + item.bookings.length,
      0,
    );
    const ratings = operatorListings.flatMap((item) =>
      item.reviews.map((review) => review.rating),
    );
    const rating = ratings.length
      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
      : 0;

    await prisma.operatorProfile.update({
      where: { id: operator.id },
      data: {
        totalBookings: bookingCount,
        rating,
      },
    });
  }

  console.log("Seed complete");
  console.log({
    admin: admin.email,
    operators: operators.length,
    destinations: destinationsData.length,
    listings: listingsData.length,
    demoLogin: "user@maharashtra-adventures.test / Password@123",
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
