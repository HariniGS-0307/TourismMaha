import { z } from "zod";

export const chatbotSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().trim().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .default([]),
});
