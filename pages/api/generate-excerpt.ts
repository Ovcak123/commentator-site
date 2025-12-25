// pages/api/generate-excerpt.ts
import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.OPENAI_API_KEY;

type Mode =
  | "excerpt"      // short standfirst (current behaviour, default)
  | "expand"       // expand into a longer section
  | "tighten"      // rewrite more tightly / concisely
  | "headline"     // suggest a sharper headline
  | "imagePrompt"; // create an image prompt for later image generation

function buildSystemPrompt(mode: Mode): string {
  switch (mode) {
    case "expand":
      return (
        "You are an editorial assistant for 'The Commentator', a serious site on " +
        "democracy, technology, and power. Expand the user's draft into a richer, " +
        "well-structured section in the same voice, without adding wild new ideas."
      );
    case "tighten":
      return (
        "You are an editor for 'The Commentator'. Rewrite the text to be tighter, " +
        "clearer, and more direct, keeping the author's voice and meaning."
      );
    case "headline":
      return (
        "You are a headline writer for 'The Commentator'. Suggest 3 sharp, serious " +
        "headlines (no clickbait) that would fit a Guardian/Atlantic-style outlet."
      );
    case "imagePrompt":
      return (
        "You help create concise, vivid prompts for an AI image generator. " +
        "You write in neutral, descriptive language suitable for editorial illustrations " +
        "about democracy, technology, and geopolitics."
      );
    case "excerpt":
    default:
      return (
        "You write sharp, concise standfirsts (2–3 sentences, max 60 words) " +
        "for 'The Commentator', a serious opinion site on AI, democracy, and geopolitics. " +
        "Neutral, analytical tone. No clickbait."
      );
  }
}

function buildUserMessageContent(mode: Mode, input: string): string {
  switch (mode) {
    case "expand":
      return (
        "Expand the following draft into a fuller section (300–600 words), " +
        "keeping the style and argument consistent. Do not add subheadings.\n\n" +
        input
      );
    case "tighten":
      return (
        "Rewrite the following text to be tighter and clearer while preserving " +
        "the meaning and tone. Shorten by roughly 20–30%.\n\n" +
        input
      );
    case "headline":
      return (
        "Based on the following article, suggest 3 alternative headlines, " +
        "numbered 1–3. Keep them serious and non-sensational.\n\n" +
        input
      );
    case "imagePrompt":
      return (
        "Based on the following article or description, write a single, clear " +
        "prompt that could be sent to an AI image generator to create an editorial " +
        "illustration. Mention style (e.g. 'clean editorial illustration'), " +
        "key objects, and mood, in one paragraph.\n\n" +
        input
      );
    case "excerpt":
    default:
      return (
        "Write a short standfirst (2–3 sentences, maximum 60 words) summarising " +
        "the following article in The Commentator's style:\n\n" +
        input
      );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY is not set on the server." });
  }

  const { input, mode } = req.body || {};

  if (typeof input !== "string" || !input.trim()) {
    return res
      .status(400)
      .json({ error: "Missing 'input' in request body" });
  }

  const normalisedMode: Mode =
    typeof mode === "string" &&
    ["excerpt", "expand", "tighten", "headline", "imagePrompt"].includes(
      mode
    )
      ? (mode as Mode)
      : "excerpt";

  try {
    const systemPrompt = buildSystemPrompt(normalisedMode);
    const userContent = buildUserMessageContent(normalisedMode, input);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.4,
        max_tokens: normalisedMode === "expand" ? 800 : 200,
      }),
    });

    if (!response.ok) {
      let details: any = null;
      try {
        details = await response.json();
      } catch {
        // ignore parse error
      }

      return res.status(500).json({
        error: "OpenAI API error",
        details: details || response.statusText,
      });
    }

    const data: any = await response.json();
    const text: string =
      data?.choices?.[0]?.message?.content?.toString().trim() ||
      "No result could be generated. Try shortening or simplifying the input.";

    // Keep the response shape backward-compatible for the existing AI Tools page
    return res.status(200).json({
      mode: normalisedMode,
      result: text,
      // excerpt is kept for current UI so nothing breaks
      excerpt: text,
    });
  } catch (err: any) {
    console.error("Error in /api/generate-excerpt:", err);
    return res.status(500).json({
      error: "Failed to generate text",
      details: err?.message ?? "Unknown error",
    });
  }
}
