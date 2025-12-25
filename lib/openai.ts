// lib/openai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in .env.local");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: generate a short excerpt for The Commentator
export async function generateExcerpt(input: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You write crisp, 1–3 sentence article excerpts for a news and commentary site called The Commentator. Keep it under 45 words.",
      },
      {
        role: "user",
        content: `Create an excerpt for the following article:\n\n${input}`,
      },
    ],
    max_tokens: 120,
  });

  const text =
    response.choices[0]?.message?.content?.toString().trim() ?? "";
  return text;
}
