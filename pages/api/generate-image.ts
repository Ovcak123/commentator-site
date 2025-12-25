// pages/api/generate-image.ts
import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.OPENAI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY is not set on the server." });
  }

  const { prompt } = req.body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res
      .status(400)
      .json({ error: "Missing 'prompt' in request body" });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt.trim(),
          size: "1024x1024",
          n: 1,
          // gpt-image-1 typically returns base64 data in `b64_json`
          // (URLs are used for some other models like dall-e-3)
        }),
      }
    );

    const text = await response.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // response wasn't JSON
    }

    if (!response.ok) {
      const apiMessage =
        json?.error?.message ||
        json?.message ||
        text ||
        response.statusText;

      console.error("OpenAI image API error:", apiMessage);

      return res.status(500).json({
        error: `OpenAI image API error: ${apiMessage}`,
      });
    }

    // For gpt-image-1, OpenAI can return base64 data in `b64_json`.
    const data0 = json?.data?.[0] || {};
    const b64 = data0.b64_json as string | undefined;
    const directUrl = data0.url as string | undefined;

    let url: string | undefined;

    if (directUrl && typeof directUrl === "string") {
      // If we ever DO get a URL, just use it.
      url = directUrl;
    } else if (b64 && typeof b64 === "string") {
      // Turn base64 into a data: URL that <img> can display.
      url = `data:image/png;base64,${b64}`;
    }

    if (!url) {
      console.error("OpenAI image API returned no usable image field:", json);
      return res
        .status(500)
        .json({ error: "No image data returned from OpenAI." });
    }

    return res.status(200).json({ url });
  } catch (err: any) {
    console.error("Error in /api/generate-image:", err);
    return res.status(500).json({
      error: "Failed to generate image",
      details: err?.message ?? "Unknown error",
    });
  }
}
