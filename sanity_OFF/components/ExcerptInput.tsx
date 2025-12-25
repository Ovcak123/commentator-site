"use client";

import React, { useState } from "react";
import { set, unset } from "sanity";

/**
 * Custom input component for the `excerpt` field.
 * Adds a "Generate excerpt" button that calls /api/generate-excerpt
 * using the current document content as the source text.
 */
function blocksToPlainText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (!block || block._type !== "block" || !Array.isArray(block.children)) {
        return "";
      }
      return block.children
        .map((child: any) =>
          typeof child.text === "string" ? child.text : ""
        )
        .join("");
    })
    .filter((str) => str.trim().length > 0)
    .join("\n\n");
}

export function ExcerptInput(props: any) {
  const { value, onChange, renderDefault, parent } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);

    try {
      const titleText =
        typeof parent?.title === "string" ? parent.title : "";
      const bodyText = blocksToPlainText(parent?.content || []);
      const source = [titleText, bodyText].filter(Boolean).join("\n\n").trim();

      if (!source) {
        setError("No title or body content to summarise yet.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/generate-excerpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: source }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      const data = await res.json();
      const excerpt = (data.excerpt || "").trim();

      if (excerpt) {
        onChange(set(excerpt));
      } else {
        onChange(unset());
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong while generating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {renderDefault(props)}
      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            border: "1px solid #2563eb",
            borderRadius: "4px",
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
            background: "transparent",
            color: "#2563eb",
          }}
        >
          {loading ? "Generating excerpt…" : "Generate excerpt with AI"}
        </button>
        {error && (
          <span style={{ fontSize: "0.75rem", color: "#dc2626" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
