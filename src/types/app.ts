export type ListingCardData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  pricePerPerson: number;
  discountPrice: number | null;
  durationHours: number | null;
  durationDays: number | null;
  difficultyLevel: string;
  images: string[];
  avgRating: number;
  status: string;
  destination: {
    name: string;
    slug: string;
    district: string;
    region: string;
  };
  category: {
    name: string;
    slug: string;
    icon: string | null;
  };
  operator: {
    id: string;
    businessName: string;
    isVerified: boolean;
    rating: number;
    totalBookings: number;
    phone: string;
  };
  availabilitySlots: Array<{
    id: string;
    date: string | Date;
    capacity: number;
    bookedCount: number;
  }>;
  _count: {
    reviews: number;
    favorites: number;
  };
};
