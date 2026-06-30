import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail(payload: EmailPayload) {
  const client = getResendClient();

  if (!client) {
    console.warn("Resend is not configured. Skipping email send.");
    return { skipped: true };
  }

  return client.emails.send({
    from: "Maharashtra Adventures <no-reply@maharashtra-adventures.com>",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}

export function bookingConfirmationTemplate(details: {
  customerName: string;
  bookingReference: string;
  listingTitle: string;
  tripDate: string;
  amount: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h1>Booking confirmed</h1>
      <p>Hi ${details.customerName},</p>
      <p>Your booking for <strong>${details.listingTitle}</strong> is confirmed.</p>
      <ul>
        <li>Booking reference: ${details.bookingReference}</li>
        <li>Trip date: ${details.tripDate}</li>
        <li>Amount paid: ${details.amount}</li>
      </ul>
      <p>See you on the trail.</p>
    </div>
  `;
}
