type GeminiPart = { text: string };

type GeminiRequest = {
  systemInstruction?: {
    parts: GeminiPart[];
  };
  contents: Array<{
    role: "user" | "model";
    parts: GeminiPart[];
  }>;
};

export async function generateGeminiResponse(request: GeminiRequest) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part: GeminiPart) => part.text)
      .join("\n") ?? ""
  );
}
