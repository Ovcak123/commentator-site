"use client";

import { useState } from "react";

export default function AIToolsPage() {
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState("");

  const [textCopied, setTextCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  // Shared button style
  const buttonBase: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    border: "1px solid #334155",
    background: "#020617",
    color: "white",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background 0.15s ease, transform 0.05s ease, opacity 0.15s ease",
  };

  function buttonStyle(disabled: boolean): React.CSSProperties {
    return {
      ...buttonBase,
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? "none" : "auto",
    };
  }

  // ---------- TEXT TOOLS ----------
  async function runTextMode(mode: string) {
    if (!textInput.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoadingText(true);
    setError("");
    setTextOutput("");
    setTextCopied(false);

    try {
      const res = await fetch("/api/generate-excerpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: textInput, mode }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch {
          /* ignore */
        }
        throw new Error(detail || "Text generation failed.");
      }

      const data = await res.json();
      const output = data.result || data.excerpt || "";
      setTextOutput(output);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoadingText(false);
    }
  }

  // ---------- COPY HELPERS ----------
  async function copyTextOutput() {
    if (!textOutput) return;
    try {
      await navigator.clipboard.writeText(textOutput);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 1500);
    } catch {
      setError("Could not copy text to clipboard.");
    }
  }

  async function copyImageUrl() {
    if (!generatedImage) return;
    try {
      await navigator.clipboard.writeText(generatedImage);
      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 1500);
    } catch {
      setError("Could not copy image URL to clipboard.");
    }
  }

  // ---------- IMAGE PROMPT + IMAGE ----------
  async function generatePrompt() {
    if (!imagePrompt.trim()) {
      setError("Enter a short description first.");
      return;
    }

    setLoadingImage(true);
    setError("");
    setGeneratedImage(null);
    setImageCopied(false);

    try {
      const res = await fetch("/api/generate-excerpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: imagePrompt,
          mode: "imagePrompt",
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch {
          /* ignore */
        }
        throw new Error(detail || "Image prompt generation failed.");
      }

      const data = await res.json();
      const output = data.result || data.excerpt || "";
      setImagePrompt(output);
    } catch (err: any) {
      setError(err.message || "Unknown error.");
    } finally {
      setLoadingImage(false);
    }
  }

  async function generateImage() {
    if (!imagePrompt.trim()) {
      setError("Enter or generate an image prompt first.");
      return;
    }

    setLoadingImage(true);
    setError("");
    setGeneratedImage(null);
    setImageCopied(false);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          detail = await res.text();
        } catch {
          /* ignore */
        }
        throw new Error(detail || "Image generation failed.");
      }

      const data = await res.json();
      setGeneratedImage(data.url || null);
    } catch (err: any) {
      setError(err.message || "Unknown error.");
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        padding: "3rem 1.5rem",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", letterSpacing: "0.08em" }}>
          AI Tools
        </h1>

        {/* ---------- TEXT TOOLS SECTION ---------- */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", opacity: 0.9 }}>
            Text Tools
          </h2>

          {/* INPUT TEXT AREA */}
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste or write any text here..."
            style={{
              width: "100%",
              height: "140px",
              padding: "1rem",
              marginBottom: "1rem",
              background: "#020617",
              border: "1px solid #334155",
              color: "white",
              borderRadius: "10px",
              fontSize: "0.95rem",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <button
              style={buttonStyle(loadingText)}
              onClick={() => runTextMode("excerpt")}
              disabled={loadingText}
            >
              Generate Excerpt
            </button>
            <button
              style={buttonStyle(loadingText)}
              onClick={() => runTextMode("tighten")}
              disabled={loadingText}
            >
              Tighten
            </button>
            <button
              style={buttonStyle(loadingText)}
              onClick={() => runTextMode("expand")}
              disabled={loadingText}
            >
              Expand
            </button>
            <button
              style={buttonStyle(loadingText)}
              onClick={() => runTextMode("headline")}
              disabled={loadingText}
            >
              Suggest Headline
            </button>
          </div>

          {loadingText && <p style={{ opacity: 0.8 }}>Processing text…</p>}

          {/* EDITABLE OUTPUT TEXT AREA + COPY BUTTON */}
          {textOutput && (
            <div style={{ marginTop: "1rem" }}>
              <textarea
                value={textOutput}
                onChange={(e) => setTextOutput(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "1rem",
                  background: "#020617",
                  border: "1px solid #334155",
                  color: "white",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  whiteSpace: "pre-wrap",
                }}
              />
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <button
                  style={buttonStyle(false)}
                  onClick={copyTextOutput}
                >
                  Copy Text
                </button>
                {textCopied && (
                  <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>Copied!</span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ---------- IMAGE TOOLS SECTION ---------- */}
        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", opacity: 0.9 }}>
            Image Tools
          </h2>

          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Write a prompt OR click 'Generate Image Prompt'..."
            style={{
              width: "100%",
              height: "100px",
              padding: "1rem",
              marginBottom: "1rem",
              background: "#020617",
              border: "1px solid #334155",
              color: "white",
              borderRadius: "10px",
              fontSize: "0.95rem",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <button
              style={buttonStyle(loadingImage)}
              onClick={generatePrompt}
              disabled={loadingImage}
            >
              Generate Image Prompt
            </button>
            <button
              style={buttonStyle(loadingImage)}
              onClick={generateImage}
              disabled={loadingImage}
            >
              Generate Image
            </button>
          </div>

          {loadingImage && <p style={{ opacity: 0.8 }}>Processing image…</p>}

          {generatedImage && (
            <div style={{ marginTop: "1rem" }}>
              <img
                src={generatedImage}
                alt="Generated"
                style={{
                  maxWidth: "100%",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <button
                  style={buttonStyle(false)}
                  onClick={copyImageUrl}
                >
                  Copy Image URL
                </button>
                {imageCopied && (
                  <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>Copied!</span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ---------- ERROR MESSAGE ---------- */}
        {error && (
          <p style={{ color: "salmon", marginTop: "1.5rem", fontWeight: "bold" }}>
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
