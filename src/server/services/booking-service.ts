import { BookingStatus } from "@prisma/client";
import { addHours, differenceInHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { createBookingReference } from "@/lib/utils";

type CreateBookingInput = {
  userId: string;
  listingId: string;
  slotId: string;
  numberOfPeople: number;
  couponCode?: string;
  specialRequests?: string;
};

export function canBookSlot(
  capacity: number,
  bookedCount: number,
  requestedPeople: number,
) {
  return capacity - bookedCount >= requestedPeople;
}

export function reserveSlotCapacity(
  capacity: number,
  bookedCount: number,
  requestedPeople: number,
) {
  if (!canBookSlot(capacity, bookedCount, requestedPeople)) {
    return {
      success: false,
      bookedCount,
    };
  }

  return {
    success: true,
    bookedCount: bookedCount + requestedPeople,
  };
}

export async function validateCoupon(couponCode?: string) {
  if (!couponCode) {
    return null;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode.toUpperCase() },
  });

  if (!coupon) {
    throw new Error("Coupon code is invalid.");
  }

  const now = new Date();
  if (
    coupon.validFrom > now ||
    coupon.validTo < now ||
    coupon.usedCount >= coupon.maxUses
  ) {
    throw new Error("Coupon code is expired or fully used.");
  }

  return coupon;
}

export async function calculateBookingPrice(
  input: Pick<
    CreateBookingInput,
    "listingId" | "numberOfPeople" | "couponCode"
  >,
) {
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: {
      id: true,
      title: true,
      pricePerPerson: true,
      discountPrice: true,
    },
  });

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const basePrice =
    (listing.discountPrice ?? listing.pricePerPerson) * input.numberOfPeople;
  const coupon = await validateCoupon(input.couponCode);
  const discountAmount = coupon
    ? Math.floor((basePrice * coupon.discountPercent) / 100)
    : 0;

  return {
    listing,
    coupon,
    basePrice,
    discountAmount,
    totalAmount: Math.max(basePrice - discountAmount, 0),
  };
}

export async function createPendingBooking(input: CreateBookingInput) {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: input.slotId },
    include: {
      listing: true,
    },
  });

  if (!slot || slot.listingId !== input.listingId) {
    throw new Error("Selected slot is invalid.");
  }

  if (!slot.isActive || slot.date < new Date()) {
    throw new Error("This slot is no longer available.");
  }

  const pricing = await calculateBookingPrice(input);

  if (!canBookSlot(slot.capacity, slot.bookedCount, input.numberOfPeople)) {
    throw new Error("This slot just filled up, pick another.");
  }

  const booking = await prisma.booking.create({
    data: {
      userId: input.userId,
      listingId: input.listingId,
      slotId: input.slotId,
      couponId: pricing.coupon?.id,
      numberOfPeople: input.numberOfPeople,
      totalAmount: pricing.totalAmount,
      discountAmount: pricing.discountAmount,
      bookingReference: createBookingReference(),
      specialRequests: input.specialRequests,
      tripDate: slot.date,
      status: BookingStatus.PENDING,
    },
    include: {
      listing: true,
      slot: true,
    },
  });

  return booking;
}

export async function confirmBookingWithCapacityCheck(params: {
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: params.bookingId },
      include: {
        slot: true,
        listing: {
          include: {
            operator: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return booking;
    }

    const freshSlot = await tx.availabilitySlot.findUnique({
      where: { id: booking.slotId },
    });

    if (
      !freshSlot ||
      !canBookSlot(
        freshSlot.capacity,
        freshSlot.bookedCount,
        booking.numberOfPeople,
      )
    ) {
      throw new Error("This slot just filled up, pick another.");
    }

    await tx.availabilitySlot.update({
      where: { id: booking.slotId },
      data: {
        bookedCount: {
          increment: booking.numberOfPeople,
        },
      },
    });

    const confirmedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        user: true,
        listing: true,
        slot: true,
      },
    });

    if (booking.couponId) {
      await tx.coupon.update({
        where: { id: booking.couponId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    await tx.operatorProfile.update({
      where: { id: booking.listing.operatorId },
      data: {
        totalBookings: {
          increment: 1,
        },
      },
    });

    await tx.notification.createMany({
      data: [
        {
          userId: booking.userId,
          type: "booking_confirmed",
          title: "Booking confirmed",
          message: `Your booking for ${booking.listing.title} is confirmed.`,
        },
        {
          userId: booking.listing.operator.userId,
          type: "new_booking",
          title: "New booking received",
          message: `${booking.user.name ?? booking.user.email} booked ${booking.listing.title}.`,
        },
      ],
    });

    return confirmedBooking;
  });
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true },
  });

  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }

  if (
    booking.status !== BookingStatus.CONFIRMED &&
    booking.status !== BookingStatus.PENDING
  ) {
    throw new Error("This booking cannot be cancelled.");
  }

  if (differenceInHours(booking.tripDate, new Date()) < 48) {
    throw new Error(
      "Bookings can only be cancelled at least 48 hours before departure.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        listing: true,
      },
    });

    if (booking.status === BookingStatus.CONFIRMED) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: {
          bookedCount: {
            decrement: booking.numberOfPeople,
          },
        },
      });
    }

    await tx.notification.create({
      data: {
        userId,
        type: "booking_cancelled",
        title: "Booking cancelled",
        message: `Your booking for ${updated.listing.title} has been cancelled.`,
      },
    });

    return updated;
  });
}

export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      listing: {
        include: {
          destination: true,
          operator: true,
        },
      },
      slot: true,
      payment: true,
      review: true,
    },
  });
}

export async function getUserBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          destination: true,
          operator: true,
        },
      },
      slot: true,
      payment: true,
      review: true,
    },
    orderBy: { tripDate: "asc" },
  });

  const now = new Date();

  return {
    upcoming: bookings.filter(
      (booking) =>
        booking.tripDate >= now && booking.status !== BookingStatus.CANCELLED,
    ),
    past: bookings.filter(
      (booking) =>
        booking.tripDate < now && booking.status !== BookingStatus.CANCELLED,
    ),
    cancelled: bookings.filter(
      (booking) => booking.status === BookingStatus.CANCELLED,
    ),
  };
}

export async function markCompletedForPastTrips() {
  const trips = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      tripDate: {
        lte: addHours(new Date(), -6),
      },
    },
  });

  if (!trips.length) {
    return 0;
  }

  const result = await prisma.booking.updateMany({
    where: {
      id: { in: trips.map((trip) => trip.id) },
    },
    data: {
      status: BookingStatus.COMPLETED,
    },
  });

  return result.count;
}
