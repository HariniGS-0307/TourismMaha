import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReviewSchema, reviewReplySchema } from "@/lib/validators/review";
import { createReview, replyToReview } from "@/server/services/review-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse({
      ...body,
      rating: Number(body.rating),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const review = await createReview({
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create review.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = reviewReplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const review = await replyToReview(
      session.user.id,
      parsed.data.reviewId,
      parsed.data.reply,
    );
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to reply to review.",
      },
      { status: 400 },
    );
  }
}
