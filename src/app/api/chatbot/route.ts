import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatbotSchema } from "@/lib/validators/chatbot";
import { answerChatMessage } from "@/server/services/chatbot-service";

export async function POST(request: Request) {
  const session = await auth();

  try {
    const body = await request.json();
    const parsed = chatbotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const response = await answerChatMessage({
      sessionId: parsed.data.sessionId,
      userId: session?.user?.id,
      message: parsed.data.message,
      history: parsed.data.history,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Chatbot request failed.",
      },
      { status: 400 },
    );
  }
}
