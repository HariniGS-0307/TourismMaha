import { PaymentStatus } from "@prisma/client";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import {
  getRazorpayClient,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";
import { bookingConfirmationTemplate, sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { confirmBookingWithCapacityCheck } from "@/server/services/booking-service";

export async function createPaymentOrder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      listing: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const amountInPaise = booking.totalAmount * 100;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const mockOrderId = `mock_order_${booking.id}`;
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        razorpayOrderId: mockOrderId,
        amount: booking.totalAmount,
        currency: "INR",
        status: PaymentStatus.CREATED,
      },
      create: {
        bookingId: booking.id,
        razorpayOrderId: mockOrderId,
        amount: booking.totalAmount,
        currency: "INR",
        status: PaymentStatus.CREATED,
      },
    });

    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: "mock_key",
      isMock: true,
    };
  }

  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: booking.bookingReference,
    notes: {
      bookingId: booking.id,
      listingTitle: booking.listing.title,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      currency: order.currency,
      status: PaymentStatus.CREATED,
    },
    create: {
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      currency: order.currency,
      status: PaymentStatus.CREATED,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
    isMock: false,
  };
}

export async function verifyAndCapturePayment(params: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const isValid = params.razorpayOrderId.startsWith("mock_order_")
    ? true
    : verifyRazorpaySignature({
        orderId: params.razorpayOrderId,
        paymentId: params.razorpayPaymentId,
        signature: params.razorpaySignature,
      });

  if (!isValid) {
    throw new Error("Payment signature verification failed.");
  }

  const booking = await confirmBookingWithCapacityCheck({
    bookingId: params.bookingId,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
  });

  const payment = await prisma.payment.update({
    where: { bookingId: params.bookingId },
    data: {
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      status: PaymentStatus.PAID,
    },
  });

  if (booking.user.email) {
    await sendEmail({
      to: booking.user.email,
      subject: "Your Maharashtra Adventures booking is confirmed",
      html: bookingConfirmationTemplate({
        customerName: booking.user.name ?? "Traveller",
        bookingReference: booking.bookingReference,
        listingTitle: booking.listing.title,
        tripDate: format(new Date(booking.tripDate), "PPP"),
        amount: formatCurrency(booking.totalAmount),
      }),
    });
  }

  return {
    booking,
    payment,
  };
}

export async function processWebhook(
  payload: string,
  signature: string | null,
) {
  if (!signature) {
    throw new Error("Missing webhook signature.");
  }

  const isMock = payload.includes("mock_order_");
  if (!isMock && !verifyRazorpayWebhookSignature(payload, signature)) {
    throw new Error("Invalid webhook signature.");
  }

  const event = JSON.parse(payload) as {
    event: string;
    payload?: {
      payment?: {
        entity?: {
          id: string;
          order_id: string;
          status: string;
          notes?: { bookingId?: string };
        };
      };
    };
  };

  const paymentEntity = event.payload?.payment?.entity;
  const bookingId = paymentEntity?.notes?.bookingId;

  if (!paymentEntity?.order_id || !bookingId) {
    return { ignored: true };
  }

  if (event.event === "payment.captured") {
    await confirmBookingWithCapacityCheck({
      bookingId,
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
    });

    await prisma.payment.updateMany({
      where: { bookingId },
      data: {
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        status: PaymentStatus.PAID,
      },
    });
  }

  if (event.event === "payment.failed") {
    await prisma.payment.updateMany({
      where: { bookingId },
      data: {
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
        status: PaymentStatus.FAILED,
      },
    });
  }

  return { ok: true };
}
