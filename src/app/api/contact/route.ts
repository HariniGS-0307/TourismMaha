import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { contactSchema } from "@/lib/validators/contact";

const SUPPORT_EMAIL = "support@maharashtra-adventures.com";

function contactSupportTemplate(details: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h1>New contact form submission</h1>
      <p><strong>Name:</strong> ${details.name}</p>
      <p><strong>Email:</strong> ${details.email}</p>
      <p><strong>Topic:</strong> ${details.topic}</p>
      <p><strong>Message:</strong></p>
      <p>${details.message.replace(/\n/g, "<br />")}</p>
    </div>
  `;
}

function contactConfirmationTemplate(details: { name: string; topic: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h1>We received your message</h1>
      <p>Hi ${details.name},</p>
      <p>Thanks for contacting Maharashtra Adventures about <strong>${details.topic}</strong>.</p>
      <p>Our support team will get back to you as soon as possible.</p>
    </div>
  `;
}

export async function POST(request: Request) {
  await auth();

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `New contact request: ${parsed.data.topic}`,
      html: contactSupportTemplate(parsed.data),
    });

    await sendEmail({
      to: parsed.data.email,
      subject: "We received your Maharashtra Adventures message",
      html: contactConfirmationTemplate({
        name: parsed.data.name,
        topic: parsed.data.topic,
      }),
    });

    return NextResponse.json({
      ok: true,
      message:
        "Thanks — your message has been sent to support. We’ll get back to you soon.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to submit contact form.",
      },
      { status: 400 },
    );
  }
}
